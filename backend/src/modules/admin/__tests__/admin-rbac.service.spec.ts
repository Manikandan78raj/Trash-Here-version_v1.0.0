import { Test, TestingModule } from "@nestjs/testing";
import { AdminRbacService } from "../services/admin-rbac.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { RoleType } from "@prisma/client";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

describe("AdminRbacService (TDD Suite)", () => {
  let service: AdminRbacService;
  let prisma: PrismaService;

  const mockUser = {
    id: "user-admin-1",
    email: "admin@trashhere.com",
    fullName: "Alice Super",
    roleId: "role-super-1",
    role: {
      id: "role-super-1",
      name: RoleType.SUPER_ADMIN,
      permissions: ["*"],
    },
  };

  const mockCollectorUser = {
    id: "user-col-1",
    email: "col@trashhere.com",
    fullName: "Bob Collector",
    roleId: "role-col-1",
    role: {
      id: "role-col-1",
      name: RoleType.COLLECTOR,
      permissions: ["fleet:read", "pickups:accept"],
    },
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRbacService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminRbacService>(AdminRbacService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it("1. should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("assignRole", () => {
    it("2. should assign an enterprise role and update permission scopes", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockCollectorUser);
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: "role-disp-1",
        name: RoleType.DISPATCHER,
        permissions: ["fleet:read", "fleet:write", "dispatch:assign"],
      });
      mockPrismaService.user.update.mockResolvedValue({
        ...mockCollectorUser,
        roleId: "role-disp-1",
        role: {
          id: "role-disp-1",
          name: RoleType.DISPATCHER,
          permissions: ["fleet:read", "fleet:write", "dispatch:assign"],
        },
      });

      const result = await service.assignRole({
        userId: "user-col-1",
        roleType: RoleType.DISPATCHER,
        permissions: ["fleet:read", "fleet:write", "dispatch:assign"],
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-col-1" },
        data: { roleId: "role-disp-1" },
        include: { role: true },
      });
      expect(result.role.name).toBe(RoleType.DISPATCHER);
    });

    it("3. should throw NotFoundException if user to assign role does not exist", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.assignRole({
          userId: "non-existent",
          roleType: RoleType.ADMIN,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("checkPermission", () => {
    it("4. should return true if user is SUPER_ADMIN with wildcard (*) scope", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const hasPerm = await service.checkPermission(
        "user-admin-1",
        "finance:reconcile",
      );
      expect(hasPerm).toBe(true);
    });

    it("5. should return true if user has exact required permission scope", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockCollectorUser);

      const hasPerm = await service.checkPermission(
        "user-col-1",
        "pickups:accept",
      );
      expect(hasPerm).toBe(true);
    });

    it("6. should return false if user lacks required permission scope", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockCollectorUser);

      const hasPerm = await service.checkPermission(
        "user-col-1",
        "finance:reconcile",
      );
      expect(hasPerm).toBe(false);
    });
  });

  describe("getUsersByRole", () => {
    it("7. should return list of users belonging to specified RoleType", async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const users = await service.getUsersByRole(RoleType.SUPER_ADMIN);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: { name: RoleType.SUPER_ADMIN } },
        include: { role: true },
      });
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe("admin@trashhere.com");
    });
  });
});
