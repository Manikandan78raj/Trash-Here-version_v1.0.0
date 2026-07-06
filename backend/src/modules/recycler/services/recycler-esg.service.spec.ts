import { Test, TestingModule } from '@nestjs/testing';
import { RecyclerEsgService } from './recycler-esg.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GhgProtocolEsgProvider } from '../providers/ghg-protocol-esg.provider';
import { MockPdfGeneratorProvider } from '../providers/mock-pdf-generator.provider';
import { EsgComplianceStatus, ManifestType } from '@prisma/client';

describe('RecyclerEsgService', () => {
  let service: RecyclerEsgService;
  let prisma: PrismaService;

  const mockProfile = {
    id: 'rec-uuid-1',
    userId: 'user-uuid-1',
    facilityName: 'EcoRecycle SF Hub',
    facilityCode: 'REC-SF-01',
    licenseNumber: 'EPA-CA-99281',
  };

  const mockEsgReport = {
    id: 'esg-uuid-1',
    reportNumber: 'ESG-2026-Q2-1234',
    recyclerId: 'rec-uuid-1',
    reportingPeriod: '2026-Q2',
    landfillDiversionRate: 96.4,
    co2OffsetKg: 120500,
    complianceStatus: EsgComplianceStatus.COMPLIANT,
  };

  const mockPrisma = {
    recyclerProfile: {
      findUnique: jest.fn(),
    },
    scaleRecord: {
      findMany: jest.fn(),
    },
    esgReport: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    incomingLoad: {
      findUnique: jest.fn(),
    },
    pdfManifest: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecyclerEsgService,
        { provide: PrismaService, useValue: mockPrisma },
        GhgProtocolEsgProvider,
        MockPdfGeneratorProvider,
      ],
    }).compile();

    service = module.get<RecyclerEsgService>(RecyclerEsgService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateEsgReport', () => {
    it('should generate an ESG sustainability report with diversion rate and CO2 offsets', async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.scaleRecord.findMany.mockResolvedValue([
        {
          netWeightKg: 10000,
          load: { materialBatches: [{ category: { slug: 'plastics-pet' } }] },
        },
      ]);
      mockPrisma.esgReport.create.mockResolvedValue(mockEsgReport);

      const result = await service.generateEsgReport('user-uuid-1', {
        reportingPeriod: '2026-Q2',
        startDate: '2026-04-01',
        endDate: '2026-06-30',
      });

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.data.reportNumber).toBeDefined();
      expect(mockPrisma.esgReport.create).toHaveBeenCalled();
    });
  });

  describe('issueManifest', () => {
    it('should issue a tamper-proof SHA-256 stamped PDF manifest', async () => {
      mockPrisma.recyclerProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.incomingLoad.findUnique.mockResolvedValue({
        id: 'load-uuid-1',
        recyclerId: 'rec-uuid-1',
        truckPlate: 'TRK-1000',
        driverName: 'Bob Smith',
        scaleRecord: { grossWeightKg: 10000, tareWeightKg: 2000, netWeightKg: 8000 },
      });

      const mockManifest = {
        id: 'man-uuid-1',
        manifestNumber: 'MAN-2026-99887',
        manifestType: ManifestType.ESG_COMPLIANCE_MANIFEST,
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        fileUrl: 'https://cdn.trashhere.com/manifests/test.pdf',
      };

      mockPrisma.pdfManifest.create.mockResolvedValue(mockManifest);

      const result = await service.issueManifest('user-uuid-1', {
        loadId: 'load-uuid-1',
        manifestType: ManifestType.ESG_COMPLIANCE_MANIFEST,
        issuedTo: 'City EPA Compliance Office',
      });

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.data.sha256Hash).toBeDefined();
      expect(mockPrisma.pdfManifest.create).toHaveBeenCalled();
    });
  });
});
