import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { ProfileService } from "./profile.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateEmailDto } from "./dto/update-email.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("Profile")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: "Get authenticated user profile and settings" })
  @ApiResponse({ status: 200, description: "Profile retrieved successfully" })
  async getProfile(@Req() req: any) {
    const data = await this.profileService.getProfile(req.user.id);
    return {
      message: "Profile retrieved successfully",
      data,
    };
  }

  @Patch()
  @ApiOperation({ summary: "Update profile information (names, phone, bio)" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  async updateProfile(@Req() req: any, @Body() updateDto: UpdateProfileDto) {
    const data = await this.profileService.updateProfile(
      req.user.id,
      updateDto,
      req,
    );
    return {
      message: "Profile updated successfully",
      data,
    };
  }

  @Patch("password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Change account password with strong regex validation",
  })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const data = await this.profileService.changePassword(
      req.user.id,
      dto,
      req,
    );
    return {
      message: "Password changed successfully",
      data,
    };
  }

  @Patch("email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update account email address with password verification",
  })
  @ApiResponse({ status: 200, description: "Email updated successfully" })
  async updateEmail(@Req() req: any, @Body() dto: UpdateEmailDto) {
    const data = await this.profileService.updateEmail(req.user.id, dto, req);
    return {
      message: "Email updated successfully",
      data,
    };
  }

  @Post("avatar")
  @UseInterceptors(FileInterceptor("avatar"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        avatar: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiOperation({ summary: "Upload profile avatar (JPEG, PNG, WEBP max 5MB)" })
  @ApiResponse({ status: 201, description: "Avatar uploaded successfully" })
  async uploadAvatar(@Req() req: any, @UploadedFile() file: any) {
    const data = await this.profileService.uploadAvatar(req.user.id, file, req);
    return {
      message: "Avatar uploaded successfully",
      data,
    };
  }

  @Post("export")
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Request async GDPR data export archive" })
  @ApiResponse({
    status: 202,
    description: "GDPR export request accepted for async processing",
  })
  async requestGdprExport(@Req() req: any) {
    const data = await this.profileService.requestGdprExport(req.user.id, req);
    return {
      message: data.message,
      data,
    };
  }
}
