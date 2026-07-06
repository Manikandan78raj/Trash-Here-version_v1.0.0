import { Test, TestingModule } from "@nestjs/testing";
import { ProfileService } from "./profile.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CloudinaryProvider } from "../../common/providers/storage/cloudinary.provider";
import {
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";

describe("ProfileService", () => {
  let service: ProfileService;
  let prisma: PrismaService;
  let cloudinaryProvider: CloudinaryProvider;

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    fullName: "John Doe",
    phone: "+15550001111",
    passwordHash: "$2a$10$hashedpasswordstring",
    avatarUrl: null,
    bio: "Test bio",
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(mockUser),
      update: jest
        .fn()
        .mockResolvedValue({ ...mockUser, fullName: "Jane Doe" }),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: "audit-1" }),
    },
    gdprExport: {
      create: jest
        .fn()
        .mockResolvedValue({ id: "export-100", status: "PROCESSING" }),
      update: jest
        .fn()
        .mockResolvedValue({ id: "export-100", status: "COMPLETED" }),
    },
  };

  const mockCloudinary = {
    upload: jest.fn().mockResolvedValue({
      url: "https://cloudinary.com/avatar.png",
      provider: "CloudinaryProvider",
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CloudinaryProvider, useValue: mockCloudinary },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prisma = module.get<PrismaService>(PrismaService);
    cloudinaryProvider = module.get<CloudinaryProvider>(CloudinaryProvider);

    jest
      .spyOn(bcrypt, "compare")
      .mockImplementation(async (plain, hash) => plain === "OldPass123!");
    jest
      .spyOn(bcrypt, "hash")
      .mockImplementation(async () => "$2a$10$newhashedpassword");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getProfile", () => {
    it("should return user profile without passwordHash", async () => {
      const result = await service.getProfile("user-123");
      expect(result).not.toHaveProperty("passwordHash");
      expect(result.email).toBe("test@example.com");
    });
  });

  describe("updateProfile", () => {
    it("should update profile fields and write audit log", async () => {
      const result = await service.updateProfile("user-123", {
        firstName: "Jane",
        lastName: "Doe",
      });
      expect(prisma.user.update).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: "profile updated" }),
        }),
      );
    });
  });

  describe("changePassword", () => {
    it("should update password when current password matches", async () => {
      const result = await service.changePassword("user-123", {
        currentPassword: "OldPass123!",
        newPassword: "NewStrongPass2026!",
      });
      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: "password changed" }),
        }),
      );
    });

    it("should throw UnauthorizedException when current password is wrong", async () => {
      await expect(
        service.changePassword("user-123", {
          currentPassword: "WrongPassword!",
          newPassword: "NewStrongPass2026!",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("updateEmail", () => {
    it("should update email and log audit when password matches and email free", async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null); // free email
      const result = await service.updateEmail("user-123", {
        newEmail: "new@example.com",
        password: "OldPass123!",
      });
      expect(prisma.user.update).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: "email changed" }),
        }),
      );
    });

    it("should throw ConflictException if email is already taken", async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ id: "other-user" });
      await expect(
        service.updateEmail("user-123", {
          newEmail: "taken@example.com",
          password: "OldPass123!",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("uploadAvatar", () => {
    it("should upload image when MIME and size are valid", async () => {
      const file = {
        mimetype: "image/png",
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from("test"),
        originalname: "avatar.png",
      };
      const result = await service.uploadAvatar("user-123", file);
      expect(result.avatarUrl).toBe("https://cloudinary.com/avatar.png");
      expect(cloudinaryProvider.upload).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: "profile updated (avatar)" }),
        }),
      );
    });

    it("should throw BadRequestException on invalid MIME type", async () => {
      const file = {
        mimetype: "application/pdf",
        size: 1024,
        buffer: Buffer.from("test"),
      };
      await expect(service.uploadAvatar("user-123", file)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when file exceeds 5MB", async () => {
      const file = {
        mimetype: "image/jpeg",
        size: 6 * 1024 * 1024,
        buffer: Buffer.from("test"),
      };
      await expect(service.uploadAvatar("user-123", file)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("requestGdprExport", () => {
    it("should create processing export record and return 202 payload", async () => {
      const result = await service.requestGdprExport("user-123");
      expect(result.status).toBe("PROCESSING");
      expect(result.exportId).toBe("export-100");
      expect(prisma.gdprExport.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: "GDPR export requested" }),
        }),
      );
    });
  });
});
