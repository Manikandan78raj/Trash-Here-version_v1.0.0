import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { RoleType } from "@prisma/client";

@ApiTags("Enterprise Admin Command Center")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
@ApiBearerAuth("access-token")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("analytics")
  @ApiOperation({
    summary:
      "Get high-level system analytics, waste volume, revenue, and carbon offset",
  })
  @ApiResponse({
    status: 200,
    description: "Enterprise analytics data returned",
  })
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get("users")
  @ApiOperation({
    summary: "Get all registered users with wallets and eco scores",
  })
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Get("collectors")
  @ApiOperation({
    summary: "Get all waste collectors with vehicle ratings and earnings",
  })
  async getCollectors() {
    return this.adminService.getCollectors();
  }

  @Get("pickups")
  @ApiOperation({ summary: "Get live system feed of all pickup requests" })
  async getPickups() {
    return this.adminService.getPickups();
  }

  @Get("revenue")
  @ApiOperation({
    summary: "Get detailed financial revenue and transaction report",
  })
  async getRevenueReport() {
    return this.adminService.getRevenueReport();
  }
}
