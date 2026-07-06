import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { PickupsService } from "./pickups.service";
import {
  CreatePickupDto,
  UpdatePickupStatusDto,
  VerifyPickupQrDto,
} from "./dto/pickups.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RoleType } from "@prisma/client";

@ApiTags("Pickup Booking & Tracking")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("access-token")
@Controller("pickups")
export class PickupsController {
  constructor(private readonly pickupsService: PickupsService) {}

  @Post()
  @ApiOperation({
    summary: "Schedule a new waste pickup with AI image verification",
  })
  @ApiResponse({
    status: 201,
    description: "Pickup scheduled and assigned to collector",
  })
  async createPickup(@CurrentUser() user: any, @Body() dto: CreatePickupDto) {
    return this.pickupsService.createPickup(user.id, dto);
  }

  @Get("my")
  @ApiOperation({ summary: "Get all pickup requests for current user" })
  async getUserPickups(@CurrentUser() user: any) {
    return this.pickupsService.getUserPickups(user.id);
  }

  @Get(":id")
  @ApiOperation({
    summary:
      "Get pickup details by ID (including collector vehicle & tracking)",
  })
  async getPickupById(@Param("id") id: string) {
    return this.pickupsService.getPickupById(id);
  }

  @Patch(":id/status")
  @Roles(RoleType.COLLECTOR, RoleType.ADMIN)
  @ApiOperation({ summary: "Update pickup status (Collector or Admin only)" })
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdatePickupStatusDto,
  ) {
    return this.pickupsService.updateStatus(id, dto);
  }

  @Patch(":id/cancel")
  @ApiOperation({
    summary: "Cancel a scheduled pickup (Customer only before arrival)",
  })
  async cancelPickup(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() body: { reason?: string },
  ) {
    return this.pickupsService.cancelPickup(user.id, id, body?.reason);
  }

  @Patch(":id/simulate-status")
  @ApiOperation({
    summary:
      "Simulate driver telemetry and status progression for live tracking demo",
  })
  async simulateStatus(
    @Param("id") id: string,
    @Body() dto: UpdatePickupStatusDto,
  ) {
    return this.pickupsService.simulateStatus(id, dto.status);
  }

  @Post("verify-qr")
  @Roles(RoleType.USER, RoleType.COLLECTOR, RoleType.ADMIN)
  @ApiOperation({
    summary:
      "Verify customer QR code secret, record verified weight, and award rewards",
  })
  @ApiResponse({
    status: 200,
    description:
      "Pickup completed! Green points awarded to customer, cash to collector.",
  })
  async verifyQrAndComplete(
    @CurrentUser() user: any,
    @Body() dto: VerifyPickupQrDto,
  ) {
    return this.pickupsService.verifyQrAndComplete(user.id, dto);
  }
}
