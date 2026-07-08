import { Test, TestingModule } from "@nestjs/testing";
import { RecyclerProcessingService } from "./recycler-processing.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { ProcessingStatus, ProcessingStage, BatchStatus } from "@prisma/client";

describe("RecyclerProcessingService", () => {
  let service: RecyclerProcessingService;
  let prisma: PrismaService;

  const mockProfile = {
    id: "rec-uuid-1",
    userId: "user-uuid-1",
    facilityName: "EcoRecycle SF Hub",
  };

  const mockBatch = {
    id: "batch-uuid-1",
    recyclerId: "rec-uuid-1",
    batchNumber: "BAT-2026-PET-1234",
    categoryId: "cat-pet-1",
    weightKg: 5000,
    status: BatchStatus.RAW_INTAKE,
  };

  const mockInventory = {
    id: "inv-uuid-1",
    recyclerId: "rec-uuid-1",
    categoryId: "cat-pet-1",
    totalWeightKg: 5000,
    availableWeightKg: 5000,
    allocatedWeightKg: 0,
  };

  const mockPrisma = {
    recyclerProfile: {
      findUnique: jest.fn(),
    },
    materialBatch: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    warehouseInventory: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    processingQueue: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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
        RecyclerProcessingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RecyclerProcessingService>(RecyclerProcessingService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("startProcessing", () => {
    it("should start manufacturing process and allocate inventory", async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.materialBatch.findUnique.mockResolvedValue(mockBatch);
      mockPrisma.warehouseInventory.findUnique.mockResolvedValue(mockInventory);

      const mockQueueItem = {
        id: "queue-uuid-1",
        machineId: "SHREDDER-01",
        processStage: ProcessingStage.SHREDDING,
        status: ProcessingStatus.IN_PROGRESS,
        inputWeightKg: 2000,
      };

      mockPrisma.processingQueue.create.mockResolvedValue(mockQueueItem);
      mockPrisma.materialBatch.update.mockResolvedValue({
        ...mockBatch,
        status: BatchStatus.SHREDDING,
      });
      mockPrisma.warehouseInventory.update.mockResolvedValue({
        ...mockInventory,
        availableWeightKg: 3000,
      });

      const result = await service.startProcessing("user-uuid-1", {
        batchId: "batch-uuid-1",
        machineId: "SHREDDER-01",
        processStage: ProcessingStage.SHREDDING,
        inputWeightKg: 2000,
      });

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.data.queueItem.machineId).toBe("SHREDDER-01");
    });

    it("should throw BadRequestException if available inventory is insufficient", async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.materialBatch.findUnique.mockResolvedValue(mockBatch);
      mockPrisma.warehouseInventory.findUnique.mockResolvedValue({
        ...mockInventory,
        availableWeightKg: 500,
      });

      await expect(
        service.startProcessing("user-uuid-1", {
          batchId: "batch-uuid-1",
          machineId: "SHREDDER-01",
          processStage: ProcessingStage.SHREDDING,
          inputWeightKg: 2000,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("completeProcessing", () => {
    it("should complete processing and record output yield and waste loss", async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.processingQueue.findUnique.mockResolvedValue({
        id: "queue-uuid-1",
        recyclerId: "rec-uuid-1",
        batchId: "batch-uuid-1",
        status: ProcessingStatus.IN_PROGRESS,
        inputWeightKg: 2000,
        batch: mockBatch,
      });
      mockPrisma.warehouseInventory.findUnique.mockResolvedValue(mockInventory);

      const mockCompletedQueue = {
        id: "queue-uuid-1",
        status: ProcessingStatus.COMPLETED,
        outputWeightKg: 1950,
        wasteLossKg: 50,
      };

      mockPrisma.processingQueue.update.mockResolvedValue(mockCompletedQueue);
      mockPrisma.materialBatch.update.mockResolvedValue({
        ...mockBatch,
        status: BatchStatus.READY_FOR_SALE,
      });
      mockPrisma.warehouseInventory.update.mockResolvedValue(mockInventory);

      const result = await service.completeProcessing(
        "user-uuid-1",
        "queue-uuid-1",
        {
          outputWeightKg: 1950,
          wasteLossKg: 50,
        },
      );

      expect(result.success).toBe(true);
      expect(result.data.queueItem.status).toBe(ProcessingStatus.COMPLETED);
    });
  });
});
