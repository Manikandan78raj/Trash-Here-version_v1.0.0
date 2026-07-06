import { Test, TestingModule } from '@nestjs/testing';
import { RecyclerIntakeService } from './recycler-intake.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { MockDigitalScaleProvider } from '../providers/mock-digital-scale.provider';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LoadStatus, InspectionGrade } from '@prisma/client';

describe('RecyclerIntakeService', () => {
  let service: RecyclerIntakeService;
  let prisma: PrismaService;
  let scaleProvider: MockDigitalScaleProvider;

  const mockProfile = {
    id: 'rec-uuid-1',
    userId: 'user-uuid-1',
    facilityName: 'EcoRecycle SF Hub',
    facilityCode: 'REC-SF-01',
    licenseNumber: 'EPA-CA-99281',
  };

  const mockLoad = {
    id: 'load-uuid-1',
    recyclerId: 'rec-uuid-1',
    truckPlate: 'TRK-9988',
    driverName: 'John Doe',
    status: LoadStatus.ARRIVED,
    manifestNumber: 'LD-2026-11223',
    actualArrival: new Date(),
  };

  const mockPrisma = {
    recyclerProfile: {
      findUnique: jest.fn(),
    },
    incomingLoad: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    scaleRecord: {
      create: jest.fn(),
      update: jest.fn(),
    },
    qualityInspection: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callbackOrArray) => {
      if (Array.isArray(callbackOrArray)) {
        return Promise.all(callbackOrArray);
      }
      return callbackOrArray(mockPrisma);
    }),
  };

  const mockScaleProvider = {
    getScaleReading: jest.fn(),
    generateDigitalSeal: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecyclerIntakeService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MockDigitalScaleProvider, useValue: mockScaleProvider },
      ],
    }).compile();

    service = module.get<RecyclerIntakeService>(RecyclerIntakeService);
    prisma = module.get<PrismaService>(PrismaService);
    scaleProvider = module.get<MockDigitalScaleProvider>(MockDigitalScaleProvider);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkInLoad', () => {
    it('should check in a vehicle and create an incoming load record', async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.incomingLoad.create.mockResolvedValue(mockLoad);

      const result = await service.checkInLoad('user-uuid-1', {
        truckPlate: 'TRK-9988',
        driverName: 'John Doe',
      });

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.data.manifestNumber).toBeDefined();
      expect(mockPrisma.incomingLoad.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if recycler profile not found', async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.checkInLoad('user-uuid-unknown', {
          truckPlate: 'TRK-9988',
          driverName: 'John Doe',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('recordWeighIn', () => {
    it('should record gross weight and digital seal for an arrived load', async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.incomingLoad.findUnique.mockResolvedValue(mockLoad);
      mockScaleProvider.getScaleReading.mockResolvedValue({
        weightKg: 14500,
        isStable: true,
        timestamp: new Date().toISOString(),
      });
      mockScaleProvider.generateDigitalSeal.mockReturnValue('hmac-seal-hash-1234');
      
      const mockScaleRecord = { id: 'scale-uuid-1', grossWeightKg: 14500, digitalSeal: 'hmac-seal-hash-1234' };
      const mockUpdatedLoad = { ...mockLoad, status: LoadStatus.WEIGHING_IN };
      
      mockPrisma.scaleRecord.create.mockResolvedValue(mockScaleRecord);
      mockPrisma.incomingLoad.update.mockResolvedValue(mockUpdatedLoad);

      const result = await service.recordWeighIn('user-uuid-1', 'load-uuid-1', {
        scaleId: 'SCALE-01',
      });

      expect(result.success).toBe(true);
      expect(result.data.scaleRecord.grossWeightKg).toBe(14500);
      expect(result.data.loadStatus).toBe(LoadStatus.WEIGHING_IN);
    });

    it('should throw BadRequestException if scale reading is unstable', async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.incomingLoad.findUnique.mockResolvedValue(mockLoad);
      mockScaleProvider.getScaleReading.mockResolvedValue({
        weightKg: 14500,
        isStable: false,
        timestamp: new Date().toISOString(),
      });

      await expect(
        service.recordWeighIn('user-uuid-1', 'load-uuid-1', { scaleId: 'SCALE-01' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('recordInspection', () => {
    it('should record quality grading and update status to INSPECTING or REJECTED', async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.incomingLoad.findUnique.mockResolvedValue({
        ...mockLoad,
        status: LoadStatus.WEIGHING_IN,
      });

      const mockInspection = { id: 'insp-uuid-1', overallGrade: InspectionGrade.GRADE_A_PURE };
      const mockUpdatedLoad = { ...mockLoad, status: LoadStatus.INSPECTING };

      mockPrisma.qualityInspection.create.mockResolvedValue(mockInspection);
      mockPrisma.incomingLoad.update.mockResolvedValue(mockUpdatedLoad);

      const result = await service.recordInspection('user-uuid-1', 'load-uuid-1', {
        overallGrade: InspectionGrade.GRADE_A_PURE,
        moisturePercent: 2.1,
        contaminationRate: 0.5,
      });

      expect(result.success).toBe(true);
      expect(result.data.loadStatus).toBe(LoadStatus.INSPECTING);
    });
  });
});
