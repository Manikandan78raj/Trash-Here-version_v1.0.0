import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("UsersService", () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: "user-1",
    email: "test@trashhere.com",
    fullName: "Test User",
    passwordHash: "secret",
    ecoScore: 950,
    carbonSavedKg: 45.0,
    role: { name: "USER" },
    addresses: [],
    wallet: { id: "w-1", pointsBalance: 500 },
    collectorProfile: null,
    _count: { pickupRequests: 10 },
  };

  const mockAddress = {
    id: "addr-1",
    userId: "user-1",
    label: "Home",
    street: "123 Main St",
    city: "Palo Alto",
    state: "CA",
    zipCode: "94301",
    lat: 37.4,
    lng: -122.1,
    isDefault: true,
  };

  const mockNotif = {
    id: "notif-1",
    userId: "user-1",
    title: "Test Notif",
    message: "Hello",
    isRead: false,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    address: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getProfile", () => {
    it("should return user profile without passwordHash", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.getProfile("user-1");
      expect(result.email).toBe("test@trashhere.com");
      expect((result as any).passwordHash).toBeUndefined();
    });

    it("should throw NotFoundException if user not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateProfile", () => {
    it("should update and return user profile without passwordHash", async () => {
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        fullName: "Updated Name",
      });
      const result = await service.updateProfile("user-1", {
        fullName: "Updated Name",
      });
      expect(result.fullName).toBe("Updated Name");
      expect((result as any).passwordHash).toBeUndefined();
    });
  });

  describe("addresses", () => {
    it("should return user addresses ordered by isDefault desc", async () => {
      mockPrismaService.address.findMany.mockResolvedValue([mockAddress]);
      const result = await service.getAddresses("user-1");
      expect(result).toEqual([mockAddress]);
    });

    it("should create address and unset old default if isDefault is true", async () => {
      mockPrismaService.address.create.mockResolvedValue(mockAddress);
      const result = await service.createAddress("user-1", {
        label: "Home",
        street: "123 Main St",
        city: "Palo Alto",
        state: "CA",
        zipCode: "94301",
        lat: 37.4,
        lng: -122.1,
        isDefault: true,
      });
      expect(mockPrismaService.address.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        data: { isDefault: false },
      });
      expect(result).toEqual(mockAddress);
    });

    it("should delete address if found", async () => {
      mockPrismaService.address.findFirst.mockResolvedValue(mockAddress);
      mockPrismaService.address.delete.mockResolvedValue(mockAddress);
      const result = await service.deleteAddress("user-1", "addr-1");
      expect(result.message).toBe("Address deleted successfully");
    });

    it("should throw NotFoundException when deleting non-existent address", async () => {
      mockPrismaService.address.findFirst.mockResolvedValue(null);
      await expect(service.deleteAddress("user-1", "unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getEcoScore", () => {
    it("should return eco score metrics and Green Champion tier", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.getEcoScore("user-1");
      expect(result).toEqual({
        ecoScore: 950,
        carbonSavedKg: 45.0,
        completedPickups: 10,
        tierLevel: "Green Champion",
      });
    });

    it("should return Eco Warrior tier for score between 700 and 899", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        ecoScore: 750,
      });
      const result = await service.getEcoScore("user-1");
      expect(result.tierLevel).toBe("Eco Warrior");
    });

    it("should return Sustainability Starter tier for score below 700", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        ecoScore: 500,
      });
      const result = await service.getEcoScore("user-1");
      expect(result.tierLevel).toBe("Sustainability Starter");
    });

    it("should throw NotFoundException if user not found for eco score", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.getEcoScore("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("notifications", () => {
    it("should return user notifications", async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([mockNotif]);
      const result = await service.getNotifications("user-1");
      expect(result).toEqual([mockNotif]);
    });

    it("should mark notification as read if found", async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(mockNotif);
      mockPrismaService.notification.update.mockResolvedValue({
        ...mockNotif,
        isRead: true,
      });
      const result = await service.markNotificationRead("user-1", "notif-1");
      expect(result.isRead).toBe(true);
    });

    it("should throw NotFoundException when marking non-existent notification", async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);
      await expect(
        service.markNotificationRead("user-1", "unknown"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
