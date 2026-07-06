import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { RoleType } from "@prisma/client";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

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
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("login", () => {
    it("should login user successfully with valid credentials", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.login({
        email: "test@trashhere.com",
        password: "Password123!",
      });

      expect(result.user.email).toBe("test@trashhere.com");
      expect(result.accessToken).toBe("mock.jwt.token");
      expect(result.refreshToken).toBe("mock.jwt.token");
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: "unknown@test.com", password: "pass" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if password mismatch", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(false));

      await expect(
        service.login({ email: "test@trashhere.com", password: "wrong" }),
      ).rejects.toThrow(UnauthorizedException);
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

      const result = await service.register({
        email: "new@trashhere.com",
        password: "Password123!",
        fullName: "New User",
      });

      expect(result.user.email).toBe("test@trashhere.com");
      expect(result.accessToken).toBe("mock.jwt.token");
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
