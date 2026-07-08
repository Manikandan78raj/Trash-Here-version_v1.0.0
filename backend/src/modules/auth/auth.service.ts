import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisCacheService } from "../../common/cache/redis-cache.service";
import {
  LoginDto,
  RegisterDto,
  SendOtpDto,
  VerifyOtpDto,
} from "./dto/auth.dto";
import { RoleType } from "@prisma/client";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisCacheService: RedisCacheService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { role: true, wallet: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new HttpException(
        "Account temporarily locked due to too many failed login attempts. Try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      const newAttempts = (user.failedLoginAttempts || 0) + 1;
      const lockoutUntil =
        newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
          ...(lockoutUntil ? { lockoutUntil } : {}),
        },
      });

      if (newAttempts >= 5) {
        this.logger.warn(
          `🚨 [Security Alert] Account locked for 15 minutes due to 5 consecutive failed logins: ${user.email}`,
        );
        throw new HttpException(
          "Account locked due to 5 consecutive failed login attempts. Try again in 15 minutes.",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new UnauthorizedException("Invalid email or password");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });

    const { passwordHash, ...userData } = user;
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role.name,
    );

    return {
      user: userData,
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email address is already registered");
    }

    const roleName = registerDto.role || RoleType.USER;
    let role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      role = await this.prisma.role.create({
        data: { name: roleName, description: `${roleName} Role` },
      });
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    const newUser = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        phone: registerDto.phone || null,
        fullName: registerDto.fullName,
        passwordHash,
        roleId: role.id,
        ecoScore: 100,
        carbonSavedKg: 0.0,
        wallet: {
          create: {
            pointsBalance: 500, // 500 green points welcome bonus!
            cashBalance: 0.0,
            totalPointsEarned: 500,
            totalCashEarned: 0.0,
          },
        },
      },
      include: { role: true, wallet: true },
    });

    const { passwordHash: _, ...userData } = newUser;
    const tokens = await this.generateTokens(
      newUser.id,
      newUser.email,
      newUser.role.name,
    );

    return {
      user: userData,
      ...tokens,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const incomingHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    if (!user.refreshTokenHash || user.refreshTokenHash !== incomingHash) {
      this.logger.error(
        `🚨 [Security Alert] Refresh token replay attack detected for userId: ${userId}. Revoking token family!`,
      );
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });
      throw new UnauthorizedException(
        "Security alert: Token replay detected. Please login again.",
      );
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role.name,
    );

    return tokens;
  }

  async logout(userId: string, accessToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });

    if (accessToken) {
      await this.redisCacheService.set(
        `auth:blocklist:${accessToken}`,
        "revoked",
        900,
      );
    }

    return {
      success: true,
      message: "Logged out successfully",
    };
  }

  async sendOtp(sendOtpDto: SendOtpDto) {
    this.logger.log(
      `📱 [SMS Simulation] Sending OTP code '123456' to phone: ${sendOtpDto.phone}`,
    );
    return {
      success: true,
      message: `OTP sent successfully to ${sendOtpDto.phone} (Use '123456' for verification in dev)`,
      devOtp: "123456",
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    if (verifyOtpDto.otp !== "123456" && verifyOtpDto.otp !== "000000") {
      throw new BadRequestException(
        "Invalid OTP code. In development use 123456.",
      );
    }

    let user = await this.prisma.user.findUnique({
      where: { phone: verifyOtpDto.phone },
      include: { role: true, wallet: true },
    });

    if (!user) {
      const userRole = await this.prisma.role.findUnique({
        where: { name: RoleType.USER },
      });
      if (!userRole)
        throw new BadRequestException("System roles not initialized");

      user = await this.prisma.user.create({
        data: {
          email: `phone_${Date.now()}@trashhere.com`,
          phone: verifyOtpDto.phone,
          fullName: `User ${verifyOtpDto.phone.slice(-4)}`,
          roleId: userRole.id,
          ecoScore: 100,
          wallet: {
            create: {
              pointsBalance: 500,
              cashBalance: 0.0,
              totalPointsEarned: 500,
              totalCashEarned: 0.0,
            },
          },
        },
        include: { role: true, wallet: true },
      });
    }

    const { passwordHash, ...userData } = user;
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role.name,
    );

    return {
      user: userData,
      ...tokens,
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>("JWT_SECRET") ||
        "super-secret-trash-here-enterprise-jwt-key-2026",
      expiresIn: "15m",
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>("REFRESH_TOKEN_SECRET") ||
        "super-secret-refresh-trash-here-key-2026",
      expiresIn: "30d",
    });

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: tokenHash },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
