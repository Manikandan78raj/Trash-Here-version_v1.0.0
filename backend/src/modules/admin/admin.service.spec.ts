import { Test, TestingModule } from "@nestjs/testing";
import { AdminService } from "./admin.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { PickupStatus } from "@prisma/client";

describe("AdminService", () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockCategory = {
    id: "cat-1",
    name: "Electronic Waste",
    slug: "e-waste",
    iconName: "Laptop",
    pickupItems: [
      {
        actualWeightKg: 10,
        estimatedWeightKg: 10,
        pickupRequest: { status: PickupStatus.COMPLETED },
      },
    ],
  };

  const mockPrismaService = {
    user: {
      count: jest.fn().mockResolvedValue(100),
      findMany: jest.fn().mockResolvedValue([]),
    },
    collector: {
      count: jest.fn().mockResolvedValue(20),
      findMany: jest.fn().mockResolvedValue([]),
    },
    pickupRequest: {
      count: jest.fn().mockResolvedValue(500),
      findMany: jest.fn().mockResolvedValue([
        {
          actualWeightKg: 10,
          actualPayout: 45.0,
          status: PickupStatus.COMPLETED,
        },
      ]),
    },
    wasteCategory: { findMany: jest.fn().mockResolvedValue([mockCategory]) },
    transaction: { findMany: jest.fn().mockResolvedValue([]) },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getAnalytics", () => {
    it("should return system analytics overview and category breakdown", async () => {
      const result = await service.getAnalytics();
      expect(result.overview.totalUsers).toBe(100);
      expect(result.overview.totalCollectors).toBe(20);
      expect(result.categoryBreakdown).toHaveLength(1);
    });
  });

  describe("getUsers", () => {
    it("should return all users", async () => {
      const result = await service.getUsers();
      expect(result).toEqual([]);
    });
  });

  describe("getCollectors", () => {
    it("should return all collectors", async () => {
      const result = await service.getCollectors();
      expect(result).toEqual([]);
    });
  });

  describe("getPickups", () => {
    it("should return all pickups", async () => {
      const result = await service.getPickups();
      expect(result).toEqual([
        {
          actualWeightKg: 10,
          actualPayout: 45.0,
          status: PickupStatus.COMPLETED,
        },
      ]);
    });
  });

  describe("getRevenueReport", () => {
    it("should return transaction report", async () => {
      const result = await service.getRevenueReport();
      expect(result.totalTransactions).toBe(0);
    });
  });
});
