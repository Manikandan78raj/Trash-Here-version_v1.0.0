import { Test, TestingModule } from '@nestjs/testing';
import { AdminConfigService } from '../services/admin-config.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AdminAuditService } from '../services/admin-audit.service';

describe('AdminConfigService (TDD Suite)', () => {
  let service: AdminConfigService;
  let prisma: PrismaService;
  let audit: AdminAuditService;

  const mockConfig = {
    id: 'cfg-1',
    key: 'BASE_PICKUP_FEE_USD',
    value: '25.00',
    description: 'Standard residential pickup base fee',
    updatedBy: 'usr-admin-1',
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  const mockPrismaService = {
    systemConfig: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const mockAuditService = {
    recordAudit: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminConfigService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AdminAuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<AdminConfigService>(AdminConfigService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AdminAuditService>(AdminAuditService);
    jest.clearAllMocks();
  });

  it('1. should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConfig', () => {
    it('2. should return stored value when key exists in database', async () => {
      mockPrismaService.systemConfig.findUnique.mockResolvedValue(mockConfig);

      const val = await service.getConfig('BASE_PICKUP_FEE_USD', '10.00');
      expect(prisma.systemConfig.findUnique).toHaveBeenCalledWith({ where: { key: 'BASE_PICKUP_FEE_USD' } });
      expect(val).toBe('25.00');
    });

    it('3. should return fallback default value when key does not exist', async () => {
      mockPrismaService.systemConfig.findUnique.mockResolvedValue(null);

      const val = await service.getConfig('NON_EXISTENT_KEY', 'default_val');
      expect(val).toBe('default_val');
    });
  });

  describe('updateConfig', () => {
    it('4. should upsert key-value pair and emit audit event', async () => {
      mockPrismaService.systemConfig.upsert.mockResolvedValue({
        ...mockConfig,
        value: '30.00',
      });

      const updated = await service.updateConfig('usr-admin-1', {
        key: 'BASE_PICKUP_FEE_USD',
        value: '30.00',
        description: 'Increased base fee',
      });

      expect(prisma.systemConfig.upsert).toHaveBeenCalledWith({
        where: { key: 'BASE_PICKUP_FEE_USD' },
        update: { value: '30.00', description: 'Increased base fee', updatedBy: 'usr-admin-1' },
        create: { key: 'BASE_PICKUP_FEE_USD', value: '30.00', description: 'Increased base fee', updatedBy: 'usr-admin-1' },
      });
      expect(audit.recordAudit).toHaveBeenCalledWith(expect.objectContaining({
        action: 'CONFIG_UPDATE',
        entity: 'SystemConfig',
      }));
      expect(updated.value).toBe('30.00');
    });
  });

  describe('getAllConfigs', () => {
    it('5. should return all stored platform configuration settings', async () => {
      mockPrismaService.systemConfig.findMany.mockResolvedValue([mockConfig]);

      const configs = await service.getAllConfigs();
      expect(prisma.systemConfig.findMany).toHaveBeenCalledWith({ orderBy: { key: 'asc' } });
      expect(configs).toHaveLength(1);
    });
  });
});
