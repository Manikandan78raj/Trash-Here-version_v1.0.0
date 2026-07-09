import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UnauthorizedException } from "@nestjs/common";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    sendOtp: jest.fn(),
    verifyOtp: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should login user and set refresh token cookie", async () => {
      mockAuthService.login.mockResolvedValue({
        user: { id: "user-1", email: "test@trashhere.com" },
        accessToken: "access-token",
        refreshToken: "refresh-token",
        expiresIn: 900,
      });

      const res = { cookie: jest.fn() };
      const result = await controller.login(
        { email: "test@trashhere.com", password: "password123" } as any,
        res,
      );

      expect(result.accessToken).toBe("access-token");
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh-token",
        expect.objectContaining({ httpOnly: true, path: "/" }),
      );
    });
  });

  describe("refresh", () => {
    it("should refresh tokens using token from body", async () => {
      mockAuthService.refreshToken.mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        expiresIn: 900,
      });

      const res = { cookie: jest.fn() };
      const result = await controller.refresh(
        { refreshToken: "old-refresh-token" },
        {},
        res,
      );

      expect(result.accessToken).toBe("new-access-token");
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        "old-refresh-token",
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "new-refresh-token",
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it("should refresh tokens using token from cookie if body is empty", async () => {
      mockAuthService.refreshToken.mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        expiresIn: 900,
      });

      const req = { cookies: { refreshToken: "cookie-refresh-token" } };
      const res = { cookie: jest.fn() };
      const result = await controller.refresh({}, req, res);

      expect(result.accessToken).toBe("new-access-token");
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        "cookie-refresh-token",
      );
    });

    it("should throw UnauthorizedException when no refresh token provided", async () => {
      await expect(controller.refresh({}, {}, {})).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("logout", () => {
    it("should logout user and clear refresh token cookie", async () => {
      mockAuthService.logout.mockResolvedValue({ success: true });

      const req = {
        headers: { authorization: "Bearer access-token" },
      };
      const res = { clearCookie: jest.fn() };
      const user = { id: "user-1" };

      const result = await controller.logout(user, req, res);

      expect(result.success).toBe(true);
      expect(mockAuthService.logout).toHaveBeenCalledWith(
        "user-1",
        "access-token",
      );
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", {
        path: "/",
      });
      expect(res.clearCookie).toHaveBeenCalledWith("refresh_token", {
        path: "/",
      });
    });
  });

  describe("getProfile", () => {
    it("should return the current user profile", async () => {
      const mockUser = { id: "user-1", email: "test@trashhere.com" };
      const result = await controller.getProfile(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
