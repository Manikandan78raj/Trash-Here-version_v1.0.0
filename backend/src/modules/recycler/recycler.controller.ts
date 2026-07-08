import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import {
  RoleType,
  LoadStatus,
  BatchStatus,
  ProcessingStatus,
} from "@prisma/client";
import { RecyclerIntakeService } from "./services/recycler-intake.service";
import { RecyclerInventoryService } from "./services/recycler-inventory.service";
import { RecyclerProcessingService } from "./services/recycler-processing.service";
import { RecyclerEsgService } from "./services/recycler-esg.service";
import {
  CheckInLoadDto,
  RecordWeighInDto,
  RecordInspectionDto,
  RecordWeighOutDto,
  CreateMaterialBatchDto,
  StartProcessingDto,
  CompleteProcessingDto,
  GenerateEsgReportDto,
  IssueManifestDto,
} from "./dto/recycler.dto";

@Controller("recycler")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.RECYCLER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
export class RecyclerController {
  constructor(
    private readonly intakeService: RecyclerIntakeService,
    private readonly inventoryService: RecyclerInventoryService,
    private readonly processingService: RecyclerProcessingService,
    private readonly esgService: RecyclerEsgService,
  ) {}

  // --- Intake & Weighbridge Endpoints ---

  @Post("intake/check-in")
  async checkInLoad(@Request() req: any, @Body() dto: CheckInLoadDto) {
    return this.intakeService.checkInLoad(req.user.id, dto);
  }

  @Post("intake/:loadId/weigh-in")
  async recordWeighIn(
    @Request() req: any,
    @Param("loadId") loadId: string,
    @Body() dto: RecordWeighInDto,
  ) {
    return this.intakeService.recordWeighIn(req.user.id, loadId, dto);
  }

  @Post("intake/:loadId/inspect")
  async recordInspection(
    @Request() req: any,
    @Param("loadId") loadId: string,
    @Body() dto: RecordInspectionDto,
  ) {
    return this.intakeService.recordInspection(req.user.id, loadId, dto);
  }

  @Post("intake/:loadId/weigh-out")
  async recordWeighOut(
    @Request() req: any,
    @Param("loadId") loadId: string,
    @Body() dto: RecordWeighOutDto,
  ) {
    return this.intakeService.recordWeighOut(req.user.id, loadId, dto);
  }

  @Get("intake/loads")
  async getFacilityLoads(
    @Request() req: any,
    @Query("status") status?: LoadStatus,
  ) {
    return this.intakeService.getFacilityLoads(req.user.id, status);
  }

  // --- Inventory & Lot Tracking Endpoints ---

  @Post("inventory/batches")
  async createBatch(@Request() req: any, @Body() dto: CreateMaterialBatchDto) {
    return this.inventoryService.createBatch(req.user.id, dto);
  }

  @Get("inventory")
  async getInventory(@Request() req: any) {
    return this.inventoryService.getInventory(req.user.id);
  }

  @Get("inventory/batches")
  async getBatches(@Request() req: any, @Query("status") status?: BatchStatus) {
    return this.inventoryService.getBatches(req.user.id, status);
  }

  // --- Manufacturing & Processing Queue Endpoints ---

  @Post("processing/start")
  async startProcessing(@Request() req: any, @Body() dto: StartProcessingDto) {
    return this.processingService.startProcessing(req.user.id, dto);
  }

  @Post("processing/:id/complete")
  async completeProcessing(
    @Request() req: any,
    @Param("id") queueId: string,
    @Body() dto: CompleteProcessingDto,
  ) {
    return this.processingService.completeProcessing(req.user.id, queueId, dto);
  }

  @Get("processing/queue")
  async getQueueItems(
    @Request() req: any,
    @Query("status") status?: ProcessingStatus,
  ) {
    return this.processingService.getQueueItems(req.user.id, status);
  }

  // --- ESG Sustainability & Compliance Manifest Endpoints ---

  @Post("esg/generate")
  async generateEsgReport(
    @Request() req: any,
    @Body() dto: GenerateEsgReportDto,
  ) {
    return this.esgService.generateEsgReport(req.user.id, dto);
  }

  @Post("esg/manifests/issue")
  async issueManifest(@Request() req: any, @Body() dto: IssueManifestDto) {
    return this.esgService.issueManifest(req.user.id, dto);
  }

  @Get("esg/reports")
  async getEsgReports(@Request() req: any) {
    return this.esgService.getEsgReports(req.user.id);
  }

  @Get("esg/manifests")
  async getManifests(@Request() req: any, @Query("loadId") loadId?: string) {
    return this.esgService.getManifests(req.user.id, loadId);
  }
}
