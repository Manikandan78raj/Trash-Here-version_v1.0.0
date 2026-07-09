import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisCacheService } from "../../common/cache/redis-cache.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private redisCacheService: RedisCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey:
        configService.get<string>("JWT_SECRET") ||
        "super-secret-trash-here-enterprise-jwt-key-2026",
    });
  }

  async validate(
    req: any,
    payload: { sub: string; email: string; role: string; iat?: number },
  ) {
    const token = req.headers?.authorization?.replace(/Bearer /i, "").trim();
    if (token) {
      const isRevoked = await this.redisCacheService.get(
        `auth:blocklist:${token}`,
      );
      if (isRevoked) {
        throw new UnauthorizedException(
          "Token has been revoked. Please login again.",
        );
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        "User account no longer exists or token invalid",
      );
    }

    if (
      user.passwordChangedAt &&
      payload.iat &&
      payload.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      throw new UnauthorizedException(
        "Password was changed recently. Please login again.",
      );
    }

    const {
      passwordHash,
      refreshTokenHash,
      mfaSecret,
      resetPasswordToken,
      emailVerificationToken,
      ...result
    } = user;
    return result;
  }
}
