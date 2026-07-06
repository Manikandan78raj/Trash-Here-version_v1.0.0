import { Test, TestingModule } from '@nestjs/testing';
import { AdminFleetService } from '../services/admin-fleet.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { DispatchStatus, PickupStatus } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AdminFleetService (TDD Suite)', () => {
  let service: AdminFleetService;
  let prisma: PrismaService;

  const mockCollector = {
    id: 'col-fleet-1',
    userId: 'usr-col-1',
    isOnline: true,
    isAvailable: true,
    rating: 4.9,
    currentLat: 37.7750,
    currentLng: -122.4195,
    serviceRadiusKm: 20,
    vehicles: [{ licensePlate: 'GREEN-88', capacityKg: 1500, isActive: true }],
    user: { fullName: 'Dave Driver', phone: '+15550011' },
    assignedPickups: [],
  };

  const mockPickupRequest = {
    id: 'pickup-job-1',
    status: PickupStatus.PENDING,
    estimatedWeightKg: 50.0,
    address: { lat: 37.7760, lng: -122.4200, street: '100 Market St' },
  };

  const mockPrismaService = {
    collector: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    pickupRequest: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    dispatchOrder: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminFleetService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminFleetService>(AdminFleetService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('1. should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLiveFleetMap', () => {
    it('2. should return active collectors with coordinates, vehicle plates, and active jobs', async () => {
      mockPrismaService.collector.findMany.mockResolvedValue([mockCollector]);

      const fleet = await service.getLiveFleetMap();
      expect(prisma.collector.findMany).toHaveBeenCalled();
      expect(fleet).toHaveLength(1);
      expect(fleet[0].vehiclePlate).toBe('GREEN-88');
      expect(fleet[0].driverName).toBe('Dave Driver');
    });
  });

  describe('calculateScore', () => {
    it('3. should calculate algorithmic dispatch score based on distance, ETA, rating, and capacity', () => {
      const scoreResult = service.calculateScore({
        collectorId: 'col-fleet-1',
        currentLat: 37.7750,
        currentLng: -122.4195,
        rating: 4.9,
        isAvailable: true,
        maxCapacityKg: 1500,
        currentLoadKg: 200,
        pickupLat: 37.7760,
        pickupLng: -122.4200,
        estimatedWeightKg: 50,
      });

      expect(scoreResult.isEligible).toBe(true);
      expect(scoreResult.score).toBeGreaterThan(80); // High score for close distance & high rating
      expect(scoreResult.distanceKm).toBeLessThan(1.0);
    });

    it('4. should mark collector ineligible if capacity is exceeded', () => {
      const scoreResult = service.calculateScore({
        collectorId: 'col-fleet-1',
        currentLat: 37.7750,
        currentLng: -122.4195,
        rating: 4.9,
        isAvailable: true,
        maxCapacityKg: 100,
        currentLoadKg: 90,
        pickupLat: 37.7760,
        pickupLng: -122.4200,
        estimatedWeightKg: 50, // 90 + 50 > 100
      });

      expect(scoreResult.isEligible).toBe(false);
      expect(scoreResult.rejectionReason).toContain('Capacity exceeded');
    });
  });

  describe('createDispatchOrder', () => {
    it('5. should evaluate available collectors and create DispatchOrder for highest scoring collector', async () => {
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue(mockPickupRequest);
      mockPrismaService.collector.findMany.mockResolvedValue([mockCollector]);
      mockPrismaService.dispatchOrder.create.mockResolvedValue({
        id: 'order-disp-1',
        pickupRequestId: 'pickup-job-1',
        collectorId: 'col-fleet-1',
        status: DispatchStatus.OFFERED,
        dispatchScore: 92.5,
      });

      const order = await service.createDispatchOrder({
        pickupRequestId: 'pickup-job-1',
        ttlSeconds: 30,
      });

      expect(prisma.dispatchOrder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          pickupRequestId: 'pickup-job-1',
          collectorId: 'col-fleet-1',
          status: DispatchStatus.OFFERED,
        }),
        include: expect.any(Object),
      });
      expect(order.status).toBe(DispatchStatus.OFFERED);
    });

    it('6. should throw NotFoundException if pickup request does not exist', async () => {
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue(null);

      await expect(
        service.createDispatchOrder({ pickupRequestId: 'non-existent' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reassignRoute', () => {
    it('7. should manually reassign pickup to new collector and cancel previous active dispatch order', async () => {
      mockPrismaService.pickupRequest.findUnique.mockResolvedValue(mockPickupRequest);
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.dispatchOrder.updateMany = jest.fn().mockResolvedValue({ count: 1 });
      mockPrismaService.pickupRequest.update.mockResolvedValue({
        ...mockPickupRequest,
        collectorId: 'col-fleet-1',
        status: PickupStatus.ASSIGNED,
      });

      const result = await service.reassignRoute({
        pickupRequestId: 'pickup-job-1',
        newCollectorId: 'col-fleet-1',
        reason: 'Driver vehicle breakdown',
      });

      expect(prisma.pickupRequest.update).toHaveBeenCalledWith({
        where: { id: 'pickup-job-1' },
        data: {
          collectorId: 'col-fleet-1',
          status: PickupStatus.ASSIGNED,
          notes: expect.any(String),
        },
      });
      expect(result.status).toBe(PickupStatus.ASSIGNED);
    });
  });
});
