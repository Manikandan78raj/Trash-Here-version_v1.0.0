import { Test, TestingModule } from "@nestjs/testing";
import { SettingsService } from "./settings.service";
import { PrismaService } from "../../common/prisma/prisma.service";

describe("SettingsService", () => {
  let service: SettingsService;
  let prisma: PrismaService;

  const mockSettings = {
    id: "settings-1",
    userId: "user-123",
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
  };

  const mockPrisma = {
    userSettings: {
      findUnique: jest.fn().mockResolvedValue(mockSettings),
      create: jest.fn().mockResolvedValue(mockSettings),
      upsert: jest
        .fn()
        .mockResolvedValue({ ...mockSettings, emailNotifications: false }),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: "audit-100" }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getSettings", () => {
    it("should return existing user settings", async () => {
      const result = await service.getSettings("user-123");
      expect(result).toEqual(mockSettings);
    });

    it("should create default settings if none exist", async () => {
      mockPrisma.userSettings.findUnique.mockResolvedValueOnce(null);
      const result = await service.getSettings("user-123");
      expect(prisma.userSettings.create).toHaveBeenCalledWith({
        data: { userId: "user-123" },
      });
      expect(result).toEqual(mockSettings);
    });
  });

  describe("updateSettings", () => {
    it("should update settings and write audit log when notification preference changes", async () => {
      const result = await service.updateSettings("user-123", {
        emailNotifications: false,
      });
      expect(prisma.userSettings.upsert).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "notification preference changed",
          }),
        }),
      );
    });

    it("should not write audit log if only non-notification settings change", async () => {
      await service.updateSettings("user-123", { theme: "DARK" });
      expect(prisma.auditLog.create).not.toHaveBeenCalled();
    });
  });
});
