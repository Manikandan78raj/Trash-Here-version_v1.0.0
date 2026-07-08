import { Test, TestingModule } from "@nestjs/testing";
import { RecyclerInventoryService } from "./recycler-inventory.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";
import { BatchStatus } from "@prisma/client";

describe("RecyclerInventoryService", () => {
  let service: RecyclerInventoryService;
  let prisma: PrismaService;

  const mockProfile = {
    id: "rec-uuid-1",
    userId: "user-uuid-1",
    facilityName: "EcoRecycle SF Hub",
  };

  const mockCategory = {
    id: "cat-pet-1",
    name: "PET Plastics",
    slug: "pet",
  };

  const mockPrisma = {
    recyclerProfile: {
      findUnique: jest.fn(),
    },
    wasteCategory: {
      findUnique: jest.fn(),
    },
    incomingLoad: {
      findUnique: jest.fn(),
    },
    materialBatch: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    warehouseInventory: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callbackOrArray) => {
      if (Array.isArray(callbackOrArray)) {
        return Promise.all(callbackOrArray);
      }
      return callbackOrArray(mockPrisma);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecyclerInventoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RecyclerInventoryService>(RecyclerInventoryService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createBatch", () => {
    it("should create a material batch and upsert warehouse inventory", async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.wasteCategory.findUnique.mockResolvedValue(mockCategory);

      const mockBatch = {
        id: "batch-uuid-1",
        batchNumber: "BAT-2026-PET-1234",
        weightKg: 5000,
        status: BatchStatus.RAW_INTAKE,
      };

      const mockInventory = {
        id: "inv-uuid-1",
        totalWeightKg: 5000,
        availableWeightKg: 5000,
      };

      mockPrisma.materialBatch.create.mockResolvedValue(mockBatch);
      mockPrisma.warehouseInventory.upsert.mockResolvedValue(mockInventory);

      const result = await service.createBatch("user-uuid-1", {
        categoryId: "cat-pet-1",
        weightKg: 5000,
        warehouseLocation: "BAY-1",
      });

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.data.batch.weightKg).toBe(5000);
      expect(mockPrisma.warehouseInventory.upsert).toHaveBeenCalled();
    });

    it("should throw NotFoundException if category does not exist", async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.wasteCategory.findUnique.mockResolvedValue(null);

      await expect(
        service.createBatch("user-uuid-1", {
          categoryId: "cat-unknown",
          weightKg: 5000,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getInventory", () => {
    it("should retrieve warehouse inventory for the facility", async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.warehouseInventory.findMany.mockResolvedValue([
        { id: "inv-1", totalWeightKg: 10000, category: mockCategory },
      ]);

      const result = await service.getInventory("user-uuid-1");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });
});
