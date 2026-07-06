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
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { CollectorsService } from "./collectors.service";
import { CollectorLogisticsService } from "./services/collector-logistics.service";
import { CollectorPayoutsService } from "./services/collector-payouts.service";
import {
  UpdateLocationDto,
  ToggleStatusDto,
  CompleteJobDto,
  InstantPayoutDto,
} from "./dto/collectors.dto";
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
  constructor(
    private readonly collectorsService: CollectorsService,
    private readonly collectorLogisticsService: CollectorLogisticsService,
    private readonly collectorPayoutsService: CollectorPayoutsService,
  ) {}

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
    // Call logistics service to emit real-time WebSocket event
    return this.collectorLogisticsService.updateLocation(user.id, dto);
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

  // --- SPRINT 7 LOGISTICS & PAYOUTS ENDPOINTS ---

  @Get("route")
  @ApiOperation({
    summary: "Get optimized daily route and polyline navigation waypoints",
  })
  async getAssignedRoute(@CurrentUser() user: any) {
    return this.collectorLogisticsService.getAssignedRoute(user.id);
  }

  @Post("jobs/:id/arrive")
  @ApiOperation({
    summary:
      "Mark collector as arrived at pickup stop and trigger customer alert",
  })
  async arriveAtStop(@CurrentUser() user: any, @Param("id") pickupId: string) {
    return this.collectorLogisticsService.arriveAtStop(user.id, pickupId);
  }

  @Post("jobs/:id/complete")
  @ApiOperation({
    summary:
      "Complete pickup job via QR code scan and Haversine GPS geofence verification",
  })
  async completePickupJob(
    @CurrentUser() user: any,
    @Param("id") pickupId: string,
    @Body() dto: CompleteJobDto,
  ) {
    return this.collectorLogisticsService.completePickupJob(
      user.id,
      pickupId,
      dto,
    );
  }

  @Get("payouts/summary")
  @ApiOperation({
    summary:
      "Get earnings summary, cash balance, and instant payout eligibility",
  })
  async getEarningsSummary(@CurrentUser() user: any) {
    return this.collectorPayoutsService.getEarningsSummary(user.id);
  }

  @Post("payouts/instant")
  @ApiOperation({
    summary: "Request instant cash withdrawal to debit card via Stripe Connect",
  })
  async requestInstantPayout(
    @CurrentUser() user: any,
    @Body() dto: InstantPayoutDto,
  ) {
    return this.collectorPayoutsService.requestInstantPayout(user.id, dto);
  }
}
