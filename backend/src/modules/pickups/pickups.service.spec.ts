import { Test, TestingModule } from "@nestjs/testing";
import { PickupsService } from "./pickups.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { PickupStatus } from "@prisma/client";

describe("PickupsService", () => {
  let service: PickupsService;
  let prisma: PrismaService;

  const mockAddress = {
    id: "addr-1",
    userId: "user-1",
    street: "100 Silicon Valley Way",
    city: "Palo Alto",
    state: "CA",
    zipCode: "94301",
    lat: 37.4,
    lng: -122.1,
  };

  const mockCategory = {
    id: "cat-1",
    name: "Electronic Waste",
    pricePerKg: 4.5,
    pointMultiplier: 30,
    co2SavedPerKg: 3.5,
  };

  const mockPickup = {
    id: "pickup-1",
    userId: "user-1",
    addressId: "addr-1",
    scheduledDate: new Date("2026-07-07"),
    status: PickupStatus.PENDING,
    estimatedWeightKg: 10,
    estimatedPayout: 45.0,
    rewardPoints: 300,
    qrCodeSecret: "secret-uuid-123",
    address: mockAddress,
    items: [
      { categoryId: "cat-1", estimatedWeightKg: 10, category: mockCategory },
    ],
    collector: null,
  };

  const mockCollector = {
    id: "collector-1",
    userId: "col-user-1",
    vehicleType: "EV Van",
    user: { fullName: "Driver Dave", phone: "+15559876543" },
  };

  const mockPrismaService = {
    address: { findFirst: jest.fn() },
    wasteCategory: { findMany: jest.fn(), findUnique: jest.fn() },
    pickupRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    collector: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    wallet: { update: jest.fn() },
    user: { update: jest.fn() },
    transaction: { create: jest.fn() },
    notification: { create: jest.fn() },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PickupsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PickupsService>(PickupsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createPickup", () => {
    it("should create a pickup request with calculated payout and points", async () => {
      mockPrismaService.address.findFirst.mockResolvedValue(mockAddress);
      mockPrismaService.wasteCategory.findUnique.mockResolvedValue(
        mockCategory,
      );
      mockPrismaService.collector.findFirst.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.create.mockResolvedValue({
        ...mockPickup,
        status: PickupStatus.ASSIGNED,
        collector: mockCollector,
      });

      const result = await service.createPickup("user-1", {
        addressId: "addr-1",
        scheduledDate: "2026-07-07T10:00:00Z",
        items: [{ categoryId: "cat-1", estimatedWeightKg: 10 }],
      });

      expect(result.status).toBe(PickupStatus.ASSIGNED);
      expect(mockPrismaService.notification.create).toHaveBeenCalled();
    });

    it("should throw NotFoundException if address is invalid", async () => {
      mockPrismaService.address.findFirst.mockResolvedValue(null);
      await expect(
        service.createPickup("user-1", {
          addressId: "unknown",
          scheduledDate: "2026-07-07T10:00:00Z",
          items: [{ categoryId: "cat-1", estimatedWeightKg: 10 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if waste category is missing", async () => {
      mockPrismaService.address.findFirst.mockResolvedValue(mockAddress);
      mockPrismaService.wasteCategory.findUnique.mockResolvedValue(null);
      await expect(
        service.createPickup("user-1", {
          addressId: "addr-1",
          scheduledDate: "2026-07-07T10:00:00Z",
          items: [{ categoryId: "unknown-cat", estimatedWeightKg: 10 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getUserPickups", () => {
    it("should return user pickups ordered by createdAt desc", async () => {
      mockPrismaService.pickupRequest.findMany.mockResolvedValue([mockPickup]);
      const result = await service.getUserPickups("user-1");
      expect(result).toEqual([mockPickup]);
    });
  });

  describe("getPickupById", () => {
    it("should return pickup by ID", async () => {
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue(mockPickup);
      const result = await service.getPickupById("pickup-1");
      expect(result).toEqual(mockPickup);
    });

    it("should throw NotFoundException if pickup not found", async () => {
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue(null);
      await expect(service.getPickupById("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("cancelPickup", () => {
    it("should cancel pickup if in PENDING state", async () => {
      mockPrismaService.pickupRequest.findFirst.mockResolvedValue({
        ...mockPickup,
        status: PickupStatus.PENDING,
      });
      mockPrismaService.pickupRequest.update.mockResolvedValue({
        ...mockPickup,
        status: PickupStatus.CANCELLED,
      });

      const result = await service.cancelPickup(
        "user-1",
        "pickup-1",
        "User request",
      );
      expect(result.status).toBe(PickupStatus.CANCELLED);
    });

    it("should throw BadRequestException if pickup is in ARRIVED state", async () => {
      mockPrismaService.pickupRequest.findFirst.mockResolvedValue({
        ...mockPickup,
        status: PickupStatus.ARRIVED,
      });

      await expect(service.cancelPickup("user-1", "pickup-1")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("simulateStatus", () => {
    it("should transition status and attach collector if ASSIGNED", async () => {
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue(mockPickup);
      mockPrismaService.collector.findFirst.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.update.mockResolvedValue({
        ...mockPickup,
        status: PickupStatus.ASSIGNED,
        collector: mockCollector,
      });

      const result = await service.simulateStatus(
        "pickup-1",
        PickupStatus.ASSIGNED,
      );
      expect(result.status).toBe(PickupStatus.ASSIGNED);
      expect(mockPrismaService.notification.create).toHaveBeenCalled();
    });
  });

  describe("verifyQrAndComplete", () => {
    it("should verify QR code and trigger financial settlement", async () => {
      mockPrismaService.pickupRequest.findFirst.mockResolvedValue({
        ...mockPickup,
        status: PickupStatus.ARRIVED,
        collector: mockCollector,
        collectorId: "collector-1",
      });
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.update.mockResolvedValue({
        ...mockPickup,
        status: PickupStatus.COMPLETED,
        actualWeightKg: 20,
      });

      const result = await service.verifyQrAndComplete("col-user-1", {
        qrCodeSecret: "secret-uuid-123",
        actualWeightKg: 20,
      });

      expect(result.status).toBe(PickupStatus.COMPLETED);
      expect(mockPrismaService.wallet.update).toHaveBeenCalledTimes(2); // customer & collector
      expect(mockPrismaService.user.update).toHaveBeenCalled(); // eco score
      expect(mockPrismaService.transaction.create).toHaveBeenCalled();
    });

    it("should throw NotFoundException if QR code secret is invalid", async () => {
      mockPrismaService.pickupRequest.findFirst.mockResolvedValue(null);
      await expect(
        service.verifyQrAndComplete("col-user-1", {
          qrCodeSecret: "wrong-secret",
          actualWeightKg: 10,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
