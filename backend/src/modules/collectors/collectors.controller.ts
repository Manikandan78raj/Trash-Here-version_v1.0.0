import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { CollectorsService } from "./collectors.service";
import { UpdateLocationDto, ToggleStatusDto } from "./dto/collectors.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RoleType } from "@prisma/client";

@ApiTags("Collector App & Jobs")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.COLLECTOR, RoleType.ADMIN)
@ApiBearerAuth("access-token")
@Controller("collectors")
export class CollectorsController {
  constructor(private readonly collectorsService: CollectorsService) {}

  @Get("dashboard")
  @ApiOperation({
    summary:
      "Get collector dashboard statistics, active vehicle, and current job",
  })
  async getDashboardStats(@CurrentUser() user: any) {
    return this.collectorsService.getDashboardStats(user.id);
  }

  @Get("jobs/available")
  @ApiOperation({ summary: "Get feed of nearby available pickup requests" })
  @ApiQuery({ name: "lat", required: false, type: Number })
  @ApiQuery({ name: "lng", required: false, type: Number })
  async getAvailableJobs(
    @Query("lat") lat?: number,
    @Query("lng") lng?: number,
  ) {
    return this.collectorsService.getAvailableJobs(lat, lng);
  }

  @Post("jobs/:id/accept")
  @ApiOperation({ summary: "Accept a pending pickup job" })
  async acceptJob(@CurrentUser() user: any, @Param("id") pickupId: string) {
    return this.collectorsService.acceptJob(user.id, pickupId);
  }

  @Patch("location")
  @ApiOperation({
    summary: "Update collector GPS coordinates for real-time customer tracking",
  })
  async updateLocation(
    @CurrentUser() user: any,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.collectorsService.updateLocation(user.id, dto);
  }

  @Patch("status")
  @ApiOperation({
    summary: "Toggle collector online/offline availability status",
  })
  async toggleOnlineStatus(
    @CurrentUser() user: any,
    @Body() dto: ToggleStatusDto,
  ) {
    return this.collectorsService.toggleOnlineStatus(user.id, dto);
  }
}
