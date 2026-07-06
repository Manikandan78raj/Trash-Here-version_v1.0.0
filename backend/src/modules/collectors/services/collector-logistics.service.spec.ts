import { Test, TestingModule } from "@nestjs/testing";
import { CollectorLogisticsService } from "./collector-logistics.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { GoogleMapsPolylineProvider } from "../providers/google-maps-polyline.provider";
import { NotificationsService } from "../../notifications/notifications.service";
import { WalletService } from "../../wallet/wallet.service";
import { CollectorLogisticsGateway } from "../gateways/collector-logistics.gateway";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { PickupStatus } from "@prisma/client";

describe("CollectorLogisticsService", () => {
  let service: CollectorLogisticsService;

  const mockCollector = {
    id: "collector-1",
    userId: "user-col-1",
    currentLat: 37.7749,
    currentLng: -122.4194,
    totalCompleted: 10,
    totalEarnings: 500,
  };

  const mockJob = {
    id: "pickup-1",
    userId: "cust-1",
    collectorId: "collector-1",
    status: PickupStatus.ASSIGNED,
    qrCodeSecret: "secret-token-123",
    estimatedWeightKg: 5,
    address: {
      street: "123 Green St",
      city: "SF",
      state: "CA",
      lat: 37.7749,
      lng: -122.4194,
    },
    user: { fullName: "Eco Bob", phone: "+15550001111" },
  };

  const mockPrismaService = {
    collector: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    pickupRequest: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockMapsRouteProvider = {
    getOptimizedRoute: jest.fn().mockResolvedValue({
      totalWaypoints: 1,
      totalDistanceKm: 2.5,
      totalDurationMin: 15,
      encodedPolyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@",
      waypoints: [],
    }),
  };

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({ id: "notif-1" }),
  };

  const mockWalletService = {
    creditEarnings: jest.fn().mockResolvedValue({ success: true }),
  };

  const mockGateway = {
    emitLocationUpdate: jest.fn(),
    emitJobStatusChange: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectorLogisticsService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: GoogleMapsPolylineProvider,
          useValue: mockMapsRouteProvider,
        },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: WalletService, useValue: mockWalletService },
        { provide: CollectorLogisticsGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<CollectorLogisticsService>(CollectorLogisticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getAssignedRoute", () => {
    it("should return optimized route and waypoints for assigned pickups", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findMany.mockResolvedValue([mockJob]);

      const result = await service.getAssignedRoute("user-col-1");
      expect(result.collectorId).toBe("collector-1");
      expect(result.encodedPolyline).toBeDefined();
      expect(mockMapsRouteProvider.getOptimizedRoute).toHaveBeenCalled();
    });

    it("should throw NotFoundException if collector not found", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(null);
      await expect(service.getAssignedRoute("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateLocation", () => {
    it("should update coordinates and emit WebSocket location update if job active", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.collector.update.mockResolvedValue({
        ...mockCollector,
        currentLat: 37.8,
      });
      mockPrismaService.pickupRequest.findFirst.mockResolvedValue({
        ...mockJob,
        status: PickupStatus.EN_ROUTE,
      });

      const result = await service.updateLocation("user-col-1", {
        lat: 37.8,
        lng: -122.4,
      });
      expect(result.currentLat).toBe(37.8);
      expect(mockGateway.emitLocationUpdate).toHaveBeenCalledWith(
        "pickup-1",
        37.8,
        -122.4,
        "collector-1",
      );
    });

    it("should update coordinates without emitting if no active job found", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.collector.update.mockResolvedValue({
        ...mockCollector,
        currentLat: 37.8,
      });
      mockPrismaService.pickupRequest.findFirst.mockResolvedValue(null);

      const result = await service.updateLocation("user-col-1", {
        lat: 37.8,
        lng: -122.4,
      });
      expect(result.currentLat).toBe(37.8);
      expect(mockGateway.emitLocationUpdate).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if collector not found in updateLocation", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(null);
      await expect(
        service.updateLocation("unknown", { lat: 37.8, lng: -122.4 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("arriveAtStop", () => {
    it("should mark job ARRIVED, notify customer, and emit WebSocket event", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.pickupRequest.update.mockResolvedValue({
        ...mockJob,
        status: PickupStatus.ARRIVED,
      });

      const result = await service.arriveAtStop("user-col-1", "pickup-1");
      expect(result.status).toBe(PickupStatus.ARRIVED);
      expect(mockNotificationsService.create).toHaveBeenCalled();
      expect(mockGateway.emitJobStatusChange).toHaveBeenCalledWith(
        "pickup-1",
        PickupStatus.ARRIVED,
        expect.any(Object),
      );
    });

    it("should throw NotFoundException if collector not found in arriveAtStop", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(null);
      await expect(service.arriveAtStop("unknown", "pickup-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException if pickup request not found in arriveAtStop", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue(null);
      await expect(
        service.arriveAtStop("user-col-1", "unknown-job"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if job is assigned to someone else", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue({
        ...mockJob,
        collectorId: "other-guy",
      });
      await expect(
        service.arriveAtStop("user-col-1", "pickup-1"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if job is already COMPLETED", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue({
        ...mockJob,
        status: PickupStatus.COMPLETED,
      });
      await expect(
        service.arriveAtStop("user-col-1", "pickup-1"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("completePickupJob", () => {
    it("should complete job when geofence and QR code are valid, credit wallet, and log audit", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue({
        ...mockJob,
        status: PickupStatus.ARRIVED,
      });
      mockPrismaService.pickupRequest.update.mockResolvedValue({
        ...mockJob,
        status: PickupStatus.COMPLETED,
        actualWeightKg: 10,
        actualPayout: 25.0,
      });

      const result = await service.completePickupJob("user-col-1", "pickup-1", {
        lat: 37.7749,
        lng: -122.4194,
        qrSecret: "secret-token-123",
        actualWeightKg: 10,
      });

      expect(result.success).toBe(true);
      expect(result.payout).toBe(25.0);
      expect(mockWalletService.creditEarnings).toHaveBeenCalledTimes(2);
      expect(mockNotificationsService.create).toHaveBeenCalled();
      expect(mockGateway.emitJobStatusChange).toHaveBeenCalledWith(
        "pickup-1",
        PickupStatus.COMPLETED,
        expect.any(Object),
      );
    });

    it("should throw NotFoundException if collector not found in completePickupJob", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(null);
      await expect(
        service.completePickupJob("unknown", "pickup-1", {
          lat: 37.7749,
          lng: -122.4194,
          qrSecret: "secret-token-123",
          actualWeightKg: 10,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if pickup request not found in completePickupJob", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue(null);
      await expect(
        service.completePickupJob("user-col-1", "unknown-job", {
          lat: 37.7749,
          lng: -122.4194,
          qrSecret: "secret-token-123",
          actualWeightKg: 10,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if job assigned to another collector in completePickupJob", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue({
        ...mockJob,
        collectorId: "other-guy",
      });
      await expect(
        service.completePickupJob("user-col-1", "pickup-1", {
          lat: 37.7749,
          lng: -122.4194,
          qrSecret: "secret-token-123",
          actualWeightKg: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if job already COMPLETED in completePickupJob", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue({
        ...mockJob,
        status: PickupStatus.COMPLETED,
      });
      await expect(
        service.completePickupJob("user-col-1", "pickup-1", {
          lat: 37.7749,
          lng: -122.4194,
          qrSecret: "secret-token-123",
          actualWeightKg: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when QR code secret does not match", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue({
        ...mockJob,
        status: PickupStatus.ARRIVED,
      });

      await expect(
        service.completePickupJob("user-col-1", "pickup-1", {
          lat: 37.7749,
          lng: -122.4194,
          qrSecret: "wrong-secret",
          actualWeightKg: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when geofence distance exceeds 100m", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue({
        ...mockJob,
        status: PickupStatus.ARRIVED,
      });

      await expect(
        service.completePickupJob("user-col-1", "pickup-1", {
          lat: 37.8, // > 5km away
          lng: -122.4194,
          qrSecret: "secret-token-123",
          actualWeightKg: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
