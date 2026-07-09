import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  LoginDto,
  RegisterDto,
  SendOtpDto,
  VerifyOtpDto,
  RefreshTokenDto,
} from "./dto/auth.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({
    status: 200,
    description: "User successfully authenticated and JWT tokens issued",
  })
  @ApiResponse({ status: 401, description: "Invalid email or password" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.login(loginDto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return result;
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register a new household, office, or collector user",
  })
  @ApiResponse({
    status: 201,
    description: "User registered successfully with 500 bonus points",
  })
  @ApiResponse({ status: 409, description: "Email already registered" })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.register(registerDto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return result;
  }

  @Post("send-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send SMS OTP verification code to mobile phone" })
  @ApiResponse({
    status: 200,
    description: "OTP sent (returns devOtp: 123456 in development)",
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify SMS OTP code and login/register user" })
  @ApiResponse({
    status: 200,
    description: "OTP verified successfully and tokens issued",
  })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.verifyOtp(verifyOtpDto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return result;
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refresh JWT access token using valid refresh token",
  })
  @ApiResponse({
    status: 200,
    description: "Tokens rotated and issued successfully",
  })
  @ApiResponse({ status: 401, description: "Invalid or expired refresh token" })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const token =
      refreshTokenDto?.refreshToken || this.extractRefreshTokenFromReq(req);

    if (!token) {
      throw new UnauthorizedException("No refresh token provided");
    }

    const tokens = await this.authService.refreshToken(token);
    this.setRefreshTokenCookie(res, tokens?.refreshToken);
    return tokens;
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout current user and revoke JWT tokens" })
  @ApiResponse({ status: 200, description: "Logged out successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async logout(
    @CurrentUser() user: any,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const accessToken = req?.headers?.authorization
      ?.replace(/Bearer /i, "")
      .trim();

    const result = await this.authService.logout(user.id, accessToken);

    if (res && typeof res.clearCookie === "function") {
      res.clearCookie("refreshToken", { path: "/" });
      res.clearCookie("refresh_token", { path: "/" });
    }

    return result;
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Get currently authenticated user profile and wallet",
  })
  @ApiResponse({ status: 200, description: "Current user profile returned" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  private extractRefreshTokenFromReq(req: any): string | undefined {
    if (req?.cookies?.refreshToken) return req.cookies.refreshToken;
    if (req?.cookies?.refresh_token) return req.cookies.refresh_token;
    if (req?.headers?.cookie) {
      const cookies = req.headers.cookie.split(";");
      for (const cookie of cookies) {
        const parts = cookie.trim().split("=");
        const name = parts[0];
        if (name === "refreshToken" || name === "refresh_token") {
          return decodeURIComponent(parts.slice(1).join("="));
        }
      }
    }
    return undefined;
  }

  private setRefreshTokenCookie(res: any, refreshToken?: string) {
    if (res && typeof res.cookie === "function" && refreshToken) {
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }
  }
}
