import { Test, TestingModule } from "@nestjs/testing";
import { JwtStrategy } from "./jwt.strategy";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisCacheService } from "../../common/cache/redis-cache.service";
import { UnauthorizedException } from "@nestjs/common";
import { RoleType } from "@prisma/client";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let prisma: PrismaService;
  let redisCacheService: RedisCacheService;

  const mockUser = {
    id: "user-1",
    email: "test@trashhere.com",
    fullName: "Test User",
    passwordHash: "hashed",
    passwordChangedAt: null,
    role: { id: "role-1", name: RoleType.USER },
    wallet: { id: "wallet-1", pointsBalance: 500 },
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue("secret"),
  };

  const mockRedisCacheService = {
    get: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisCacheService, useValue: mockRedisCacheService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prisma = module.get<PrismaService>(PrismaService);
    redisCacheService = module.get<RedisCacheService>(RedisCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  it("should validate and return user profile when token is valid and not in blocklist", async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
    mockRedisCacheService.get.mockResolvedValue(null);

    const mockReq = {
      headers: { authorization: "Bearer valid.access.token" },
    };
    const payload = {
      sub: "user-1",
      email: "test@trashhere.com",
      role: RoleType.USER,
      iat: Math.floor(Date.now() / 1000),
    };

    const result = await strategy.validate(mockReq, payload);
    expect(result.email).toBe("test@trashhere.com");
    expect(mockRedisCacheService.get).toHaveBeenCalledWith(
      "auth:blocklist:valid.access.token",
    );
  });

  it("should throw UnauthorizedException when token is in Redis blocklist", async () => {
    mockRedisCacheService.get.mockResolvedValue("revoked");

    const mockReq = {
      headers: { authorization: "Bearer revoked.access.token" },
    };
    const payload = {
      sub: "user-1",
      email: "test@trashhere.com",
      role: RoleType.USER,
      iat: Math.floor(Date.now() / 1000),
    };

    await expect(strategy.validate(mockReq, payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("should throw UnauthorizedException when token was issued before passwordChangedAt", async () => {
    const userChangedPassword = {
      ...mockUser,
      passwordChangedAt: new Date(Date.now() - 10000), // Changed 10s ago
    };
    mockPrismaService.user.findUnique.mockResolvedValue(userChangedPassword);
    mockRedisCacheService.get.mockResolvedValue(null);

    const mockReq = {
      headers: { authorization: "Bearer old.access.token" },
    };
    // Token issued 60 seconds ago (before password change!)
    const payload = {
      sub: "user-1",
      email: "test@trashhere.com",
      role: RoleType.USER,
      iat: Math.floor((Date.now() - 60000) / 1000),
    };

    await expect(strategy.validate(mockReq, payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("should throw UnauthorizedException when user no longer exists in database", async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockRedisCacheService.get.mockResolvedValue(null);

    const mockReq = {
      headers: { authorization: "Bearer valid.access.token" },
    };
    const payload = {
      sub: "non-existent-user",
      email: "test@trashhere.com",
      role: RoleType.USER,
      iat: Math.floor(Date.now() / 1000),
    };

    await expect(strategy.validate(mockReq, payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
