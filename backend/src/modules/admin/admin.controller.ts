import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminRbacService } from "./services/admin-rbac.service";
import { AdminFleetService } from "./services/admin-fleet.service";
import { AdminFinanceService } from "./services/admin-finance.service";
import { AdminAuditService } from "./services/admin-audit.service";
import { AdminImpersonationService } from "./services/admin-impersonation.service";
import { AdminConfigService } from "./services/admin-config.service";
import {
  AssignRoleDto,
  CreateDispatchOrderDto,
  ReassignRouteDto,
  StartImpersonationDto,
  StopImpersonationDto,
  UpdateSystemConfigDto,
  AuditFilterDto,
  FinanceReconcileDto,
} from "./dto/admin.dto";
import { RoleType } from "@prisma/client";

@Controller("admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly rbacService: AdminRbacService,
    private readonly fleetService: AdminFleetService,
    private readonly financeService: AdminFinanceService,
    private readonly auditService: AdminAuditService,
    private readonly impersonationService: AdminImpersonationService,
    private readonly configService: AdminConfigService,
  ) {}

  // --- Legacy & Overview Analytics Endpoints ---
  @Get("analytics")
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get("analytics/chart")
  async getAnalyticsChartData(@Query("period") period?: string) {
    return this.adminService.getAnalyticsChartData(period || "30d");
  }

  @Get("activity")
  async getRecentActivity(@Query("limit") limit?: string) {
    return this.adminService.getRecentActivity(
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get("status")
  async getSystemStatus() {
    return this.adminService.getSystemStatus();
  }

  // --- RBAC Endpoints ---
  @Post("roles/assign")
  async assignRole(@Body() dto: AssignRoleDto) {
    return this.rbacService.assignRole(dto);
  }

  @Get("users/role/:roleType")
  async getUsersByRole(@Param("roleType") roleType: RoleType) {
    return this.rbacService.getUsersByRole(roleType);
  }

  // --- Fleet & Dispatch Endpoints ---
  @Get("fleet/map")
  async getLiveFleetMap() {
    return this.fleetService.getLiveFleetMap();
  }

  @Post("dispatch/order")
  async createDispatchOrder(@Body() dto: CreateDispatchOrderDto) {
    return this.fleetService.createDispatchOrder(dto);
  }

  @Put("dispatch/reassign")
  async reassignRoute(@Body() dto: ReassignRouteDto) {
    return this.fleetService.reassignRoute(dto);
  }

  // --- Finance & P&L Endpoints ---
  @Get("finance/pnl")
  async getPnLSnapshot(@Query() query: FinanceReconcileDto) {
    const start = query.startDate
      ? new Date(query.startDate)
      : new Date("2026-01-01");
    const end = query.endDate
      ? new Date(query.endDate)
      : new Date("2026-12-31");
    return this.financeService.calculatePnL(start, end);
  }

  @Post("finance/reconcile")
  async reconcileLedgers() {
    return this.financeService.reconcileLedgers();
  }

  // --- Audit & Security Endpoints ---
  @Get("audit/logs")
  async getAuditLogs(@Query() filter: AuditFilterDto) {
    return this.auditService.getAuditLogs(filter);
  }

  // --- Impersonation Endpoints ---
  @Post("impersonate/start")
  async startImpersonation(
    @Req() req: any,
    @Body() dto: StartImpersonationDto,
  ) {
    const adminId = req.user?.id || "usr-admin-default";
    const ip = req.ip || "127.0.0.1";
    const ua = req.headers?.["user-agent"] || "Unknown";
    return this.impersonationService.startImpersonation(adminId, dto, ip, ua);
  }

  @Post("impersonate/stop")
  async stopImpersonation(@Body() dto: StopImpersonationDto) {
    return this.impersonationService.stopImpersonation(dto.impersonationLogId);
  }

  // --- System Config Endpoints ---
  @Get("config")
  async getAllConfigs() {
    return this.configService.getAllConfigs();
  }

  @Put("config")
  async updateConfig(@Req() req: any, @Body() dto: UpdateSystemConfigDto) {
    const adminId = req.user?.id || "usr-admin-default";
    return this.configService.updateConfig(adminId, dto);
  }
}
