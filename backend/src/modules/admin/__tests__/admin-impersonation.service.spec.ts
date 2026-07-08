import { Test, TestingModule } from "@nestjs/testing";
import { AdminImpersonationService } from "../services/admin-impersonation.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { AdminAuditService } from "../services/admin-audit.service";
import { RoleType } from "@prisma/client";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

describe("AdminImpersonationService (TDD Suite)", () => {
  let service: AdminImpersonationService;
  let prisma: PrismaService;
  let audit: AdminAuditService;

  const mockTargetUser = {
    id: "usr-target-1",
    email: "user@trashhere.com",
    fullName: "Normal User",
    role: { name: RoleType.USER },
  };

  const mockSuperAdminUser = {
    id: "usr-super-1",
    email: "super@trashhere.com",
    fullName: "Super Admin",
    role: { name: RoleType.SUPER_ADMIN },
  };

  const mockImpersonationLog = {
    id: "imp-log-1",
    adminId: "usr-admin-1",
    targetUserId: "usr-target-1",
    reason: "Ticket #8891 - Wallet topup error",
    startedAt: new Date(),
    endedAt: null,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    adminImpersonationLog: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAuditService = {
    recordAudit: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminImpersonationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AdminAuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<AdminImpersonationService>(AdminImpersonationService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AdminAuditService>(AdminAuditService);
    jest.clearAllMocks();
  });

  it("1. should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("startImpersonation", () => {
    it("2. should verify target user is not SUPER_ADMIN, create log, emit audit event, and return token", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockTargetUser);
      mockPrismaService.adminImpersonationLog.create.mockResolvedValue(
        mockImpersonationLog,
      );

      const result = await service.startImpersonation(
        "usr-admin-1",
        {
          targetUserId: "usr-target-1",
          reason: "Ticket #8891 - Wallet topup error",
        },
        "10.0.0.1",
        "Mozilla/5.0",
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "usr-target-1" },
        include: { role: true },
      });
      expect(prisma.adminImpersonationLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adminId: "usr-admin-1",
          targetUserId: "usr-target-1",
          reason: "Ticket #8891 - Wallet topup error",
          ipAddress: "10.0.0.1",
        }),
      });
      expect(audit.recordAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "IMPERSONATION_START",
          entity: "User",
          entityId: "usr-target-1",
        }),
      );
      expect(result.token).toBeDefined();
      expect(result.impersonationLogId).toBe("imp-log-1");
    });

    it("3. should throw ForbiddenException when attempting to impersonate a SUPER_ADMIN", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockSuperAdminUser);

      await expect(
        service.startImpersonation("usr-admin-1", {
          targetUserId: "usr-super-1",
          reason: "Audit",
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("4. should throw NotFoundException when target user does not exist", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.startImpersonation("usr-admin-1", {
          targetUserId: "non-existent",
          reason: "Test",
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("stopImpersonation", () => {
    it("5. should update endedAt timestamp and emit audit event", async () => {
      mockPrismaService.adminImpersonationLog.findUnique.mockResolvedValue(
        mockImpersonationLog,
      );
      mockPrismaService.adminImpersonationLog.update.mockResolvedValue({
        ...mockImpersonationLog,
        endedAt: new Date(),
      });

      const result = await service.stopImpersonation("imp-log-1");

      expect(prisma.adminImpersonationLog.update).toHaveBeenCalledWith({
        where: { id: "imp-log-1" },
        data: { endedAt: expect.any(Date) },
      });
      expect(audit.recordAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "IMPERSONATION_END",
          entity: "AdminImpersonationLog",
          entityId: "imp-log-1",
        }),
      );
      expect(result.endedAt).not.toBeNull();
    });
  });
});
