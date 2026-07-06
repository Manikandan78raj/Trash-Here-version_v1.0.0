import { Test, TestingModule } from "@nestjs/testing";
import { CollectorsService } from "./collectors.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { PickupStatus } from "@prisma/client";

describe("CollectorsService", () => {
  let service: CollectorsService;
  let prisma: PrismaService;

  const mockCollector = {
    id: "collector-1",
    userId: "user-col-1",
    rating: 4.9,
    totalCompleted: 150,
    totalEarnings: 1250.0,
    isOnline: true,
    isAvailable: true,
    currentLat: 37.4,
    currentLng: -122.1,
    vehicles: [
      { id: "veh-1", vehicleType: "EV Van", licensePlate: "GREEN-EV" },
    ],
    user: {
      fullName: "Driver Dave",
      email: "dave@trashhere.com",
      phone: "+15550001111",
    },
  };

  const mockJob = {
    id: "pickup-1",
    userId: "cust-1",
    collectorId: "collector-1",
    status: PickupStatus.ASSIGNED,
    estimatedPayout: 50.0,
    address: { lat: 37.45, lng: -122.15 },
    items: [],
    user: { fullName: "Customer Bob", phone: "+15552223333", avatarUrl: null },
  };

  const mockPrismaService = {
    collector: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    pickupRequest: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectorsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CollectorsService>(CollectorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getDashboardStats", () => {
    it("should return collector dashboard stats with active job and earnings", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findFirst.mockResolvedValue(mockJob);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      const result = await service.getDashboardStats("user-col-1");
      expect(result.profile).toEqual(mockCollector);
      expect(result.activeJob).toEqual(mockJob);
      expect(result.stats.totalCompleted).toBe(150);
    });

    it("should throw NotFoundException if collector profile not found", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(null);
      await expect(service.getDashboardStats("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getAvailableJobs", () => {
    it("should return pending jobs with simulated distance and duration", async () => {
      mockPrismaService.pickupRequest.findMany.mockResolvedValue([
        { ...mockJob, status: PickupStatus.PENDING, collectorId: null },
      ]);

      const result = await service.getAvailableJobs(37.4, -122.1, 25);
      expect(result).toHaveLength(1);
      expect(result[0].distanceKm).toBeDefined();
      expect(result[0].estimatedDurationMin).toBeDefined();
    });
  });

  describe("acceptJob", () => {
    it("should accept job and mark collector unavailable", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue({
        ...mockJob,
        status: PickupStatus.PENDING,
        collectorId: null,
      });
      mockPrismaService.pickupRequest.update.mockResolvedValue({
        ...mockJob,
        status: PickupStatus.ASSIGNED,
      });
      mockPrismaService.collector.update.mockResolvedValue({
        ...mockCollector,
        isAvailable: false,
      });

      const result = await service.acceptJob("user-col-1", "pickup-1");
      expect(result.status).toBe(PickupStatus.ASSIGNED);
      expect(mockPrismaService.collector.update).toHaveBeenCalledWith({
        where: { id: "collector-1" },
        data: { isAvailable: false },
      });
    });

    it("should throw BadRequestException if job is not PENDING", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue({
        ...mockJob,
        status: PickupStatus.COMPLETED,
        collectorId: "other-collector",
      });

      await expect(service.acceptJob("user-col-1", "pickup-1")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("updateLocation", () => {
    it("should update collector coordinates", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.collector.update.mockResolvedValue({
        ...mockCollector,
        currentLat: 37.5,
        currentLng: -122.2,
      });

      const result = await service.updateLocation("user-col-1", {
        lat: 37.5,
        lng: -122.2,
      });
      expect(result.currentLat).toBe(37.5);
    });
  });

  describe("toggleOnlineStatus", () => {
    it("should toggle collector online status", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.collector.update.mockResolvedValue({
        ...mockCollector,
        isOnline: false,
      });

      const result = await service.toggleOnlineStatus("user-col-1", {
        isOnline: false,
      });
      expect(result.isOnline).toBe(false);
    });
  });
});
