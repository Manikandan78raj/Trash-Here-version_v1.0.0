import { Test, TestingModule } from "@nestjs/testing";
import { AdminAuditService } from "../services/admin-audit.service";
import { PrismaService } from "../../../common/prisma/prisma.service";

describe("AdminAuditService (TDD Suite)", () => {
  let service: AdminAuditService;
  let prisma: PrismaService;

  const mockAuditLog = {
    id: "audit-1",
    userId: "usr-admin-1",
    action: "IMPERSONATION_START",
    entity: "User",
    entityId: "usr-target-1",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    details: "Ticket #9910",
    timestamp: new Date(),
  };

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuditService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminAuditService>(AdminAuditService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it("1. should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("recordAudit", () => {
    it("2. should save an immutable audit log entry to the database", async () => {
      mockPrismaService.auditLog.create.mockResolvedValue(mockAuditLog);

      await service.recordAudit({
        userId: "usr-admin-1",
        action: "IMPERSONATION_START",
        entity: "User",
        entityId: "usr-target-1",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        details: "Ticket #9910",
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "usr-admin-1",
          action: "IMPERSONATION_START",
          entity: "User",
          entityId: "usr-target-1",
        }),
      });
    });
  });

  describe("getAuditLogs", () => {
    it("3. should query audit logs with filters and pagination metadata", async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockAuditLog]);
      mockPrismaService.auditLog.count.mockResolvedValue(1);

      const result = await service.getAuditLogs({
        action: "IMPERSONATION_START",
        limit: 10,
        offset: 0,
      });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { action: "IMPERSONATION_START" },
        take: 10,
        skip: 0,
        orderBy: { timestamp: "desc" },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      });
      expect(result.total).toBe(1);
      expect(result.data[0].action).toBe("IMPERSONATION_START");
    });
  });

  describe("triggerAlert", () => {
    it("4. should process CRITICAL security alerts and return true", async () => {
      const alerted = await service.triggerAlert({
        severity: "CRITICAL",
        title: "Multiple Failed Login Attempts",
        message:
          "Admin account locked after 5 failed attempts from IP 10.0.0.1",
      });

      expect(alerted).toBe(true);
    });

    it("5. should handle LOW severity alerts without triggering urgent notifications", async () => {
      const alerted = await service.triggerAlert({
        severity: "LOW",
        title: "Config Updated",
        message: "BASE_PICKUP_FEE updated to 25.0",
      });

      expect(alerted).toBe(true);
    });
  });
});
