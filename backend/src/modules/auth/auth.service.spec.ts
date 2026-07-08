import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { RoleType } from "@prisma/client";
import { RedisCacheService } from "../../common/cache/redis-cache.service";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let redisCacheService: RedisCacheService;

  const mockRole = {
    id: "role-1",
    name: RoleType.USER,
    description: "User Role",
  };

  const mockUser = {
    id: "user-1",
    email: "test@trashhere.com",
    fullName: "Test User",
    phone: "+15551234567",
    passwordHash: "$2a$10$mockedhashedpasswordstring",
    roleId: "role-1",
    role: mockRole,
    wallet: { id: "wallet-1", pointsBalance: 500, cashBalance: 0 },
    failedLoginAttempts: 0,
    lockoutUntil: null,
    refreshTokenHash:
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // SHA-256 of empty string or test string
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue("mock.jwt.token"),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue("secret"),
  };

  const mockRedisCacheService = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RedisCacheService, useValue: mockRedisCacheService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    redisCacheService = module.get<RedisCacheService>(RedisCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("login", () => {
    it("should login user successfully with valid credentials and reset failed attempts", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.login({
        email: "test@trashhere.com",
        password: "Password123!",
      });

      expect(result.user.email).toBe("test@trashhere.com");
      expect(result.accessToken).toBe("mock.jwt.token");
      expect(result.refreshToken).toBeDefined();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: expect.objectContaining({
          failedLoginAttempts: 0,
          lockoutUntil: null,
        }),
      });
    });

    it("should throw HttpException (429) if account is currently locked out", async () => {
      const lockedUser = {
        ...mockUser,
        lockoutUntil: new Date(Date.now() + 600000), // Locked for 10 more minutes
      };
      mockPrismaService.user.findUnique.mockResolvedValue(lockedUser);

      await expect(
        service.login({
          email: "test@trashhere.com",
          password: "Password123!",
        }),
      ).rejects.toThrow(HttpException);
    });

    it("should throw UnauthorizedException and increment failed attempts if password mismatch", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        failedLoginAttempts: 1,
      });
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(false));

      await expect(
        service.login({ email: "test@trashhere.com", password: "wrong" }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { failedLoginAttempts: { increment: 1 } },
      });
    });

    it("should lock account for 15 minutes on 5th consecutive failed attempt", async () => {
      const userAt4Attempts = { ...mockUser, failedLoginAttempts: 4 };
      mockPrismaService.user.findUnique.mockResolvedValue(userAt4Attempts);
      mockPrismaService.user.update.mockResolvedValue({
        ...userAt4Attempts,
        failedLoginAttempts: 5,
      });
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(false));

      await expect(
        service.login({ email: "test@trashhere.com", password: "wrong" }),
      ).rejects.toThrow(HttpException);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: expect.objectContaining({
          failedLoginAttempts: { increment: 1 },
          lockoutUntil: expect.any(Date),
        }),
      });
    });
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.register({
        email: "new@trashhere.com",
        password: "Password123!",
        fullName: "New User",
      });

      expect(result.user.email).toBe("test@trashhere.com");
      expect(result.accessToken).toBe("mock.jwt.token");
      expect(result.refreshToken).toBeDefined();
    });

    it("should throw ConflictException if email already registered", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: "test@trashhere.com",
          password: "Password123!",
          fullName: "Test User",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("refreshToken", () => {
    it("should rotate refresh token successfully with valid token", async () => {
      const rawToken = "valid_refresh_token_string";
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      const userWithHash = { ...mockUser, refreshTokenHash: tokenHash };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithHash);
      mockPrismaService.user.update.mockResolvedValue(userWithHash);

      const result = await service.refreshToken("user-1", rawToken);
      expect(result.accessToken).toBe("mock.jwt.token");
      expect(result.refreshToken).toBeDefined();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { refreshTokenHash: expect.any(String) },
      });
    });

    it("should revoke all refresh tokens and throw UnauthorizedException on token replay detection", async () => {
      const rawToken = "old_replayed_token";
      const userWithDifferentHash = {
        ...mockUser,
        refreshTokenHash: "different_hash",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(
        userWithDifferentHash,
      );
      mockPrismaService.user.update.mockResolvedValue({
        ...userWithDifferentHash,
        refreshTokenHash: null,
      });

      await expect(service.refreshToken("user-1", rawToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { refreshTokenHash: null },
      });
    });
  });

  describe("logout", () => {
    it("should clear refreshTokenHash in DB and add access token to Redis blocklist", async () => {
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: null,
      });

      const result = await service.logout("user-1", "mock.access.token");
      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { refreshTokenHash: null },
      });
      expect(mockRedisCacheService.set).toHaveBeenCalledWith(
        expect.stringContaining("auth:blocklist:"),
        "revoked",
        900,
      );
    });
  });

  describe("sendOtp", () => {
    it("should simulate sending SMS OTP successfully", async () => {
      const result = await service.sendOtp({ phone: "+15551234567" });
      expect(result.success).toBe(true);
      expect(result.devOtp).toBe("123456");
    });
  });

  describe("verifyOtp", () => {
    it("should verify OTP and return tokens for existing user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.verifyOtp({
        phone: "+15551234567",
        otp: "123456",
      });

      expect(result.user.phone).toBe("+15551234567");
      expect(result.accessToken).toBe("mock.jwt.token");
    });

    it("should throw BadRequestException if OTP code is invalid", async () => {
      await expect(
        service.verifyOtp({ phone: "+15551234567", otp: "999999" }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
