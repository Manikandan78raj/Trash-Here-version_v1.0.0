import { Controller, Get, Patch, Body, UseGuards, Req } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { SettingsService } from "./settings.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("Settings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: "Get user settings and notification preferences" })
  @ApiResponse({ status: 200, description: "Settings retrieved successfully" })
  async getSettings(@Req() req: any) {
    const data = await this.settingsService.getSettings(req.user.id);
    return {
      message: "Settings retrieved successfully",
      data,
    };
  }

  @Patch()
  @ApiOperation({
    summary: "Update user settings (triggers audit log on preference change)",
  })
  @ApiResponse({ status: 200, description: "Settings updated successfully" })
  async updateSettings(@Req() req: any, @Body() dto: UpdateSettingsDto) {
    const data = await this.settingsService.updateSettings(
      req.user.id,
      dto,
      req,
    );
    return {
      message: "Settings updated successfully",
      data,
    };
  }
}
