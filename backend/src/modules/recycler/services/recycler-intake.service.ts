import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { MockDigitalScaleProvider } from '../providers/mock-digital-scale.provider';
import {
  CheckInLoadDto,
  RecordWeighInDto,
  RecordInspectionDto,
  RecordWeighOutDto,
} from '../dto/recycler.dto';
import { LoadStatus, InspectionGrade } from '@prisma/client';

@Injectable()
export class RecyclerIntakeService {
  private readonly logger = new Logger(RecyclerIntakeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly digitalScaleProvider: MockDigitalScaleProvider,
  ) {}

  async getRecyclerProfile(userId: string) {
    const profile = await this.prisma.recyclerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Recycler profile not found for current user.');
    }
    return profile;
  }

  async checkInLoad(userId: string, dto: CheckInLoadDto) {
    const recycler = await this.getRecyclerProfile(userId);

    const manifestNumber = `LD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    this.logger.log(`Facility [${recycler.facilityCode}] checking in vehicle [${dto.truckPlate}] under manifest [${manifestNumber}]`);

    const load = await this.prisma.incomingLoad.create({
      data: {
        recyclerId: recycler.id,
        collectorId: dto.collectorId || null,
        truckPlate: dto.truckPlate.toUpperCase(),
        driverName: dto.driverName,
        sourceType: dto.sourceType || 'COLLECTOR_FLEET',
        manifestNumber,
        scheduledArrival: dto.scheduledArrival ? new Date(dto.scheduledArrival) : new Date(),
        status: LoadStatus.ARRIVED,
      },
    });

    return {
      success: true,
      statusCode: 201,
      message: 'Vehicle checked in successfully.',
      data: load,
      timestamp: new Date().toISOString(),
    };
  }

  async recordWeighIn(userId: string, loadId: string, dto: RecordWeighInDto) {
    const recycler = await this.getRecyclerProfile(userId);
    const load = await this.prisma.incomingLoad.findUnique({
      where: { id: loadId },
    });

    if (!load || load.recyclerId !== recycler.id) {
      throw new NotFoundException('Incoming load not found in this facility.');
    }

    if (load.status !== LoadStatus.ARRIVED) {
      throw new BadRequestException(`Load must be in ARRIVED status to weigh in. Current status: ${load.status}`);
    }

    const scaleReading = await this.digitalScaleProvider.getScaleReading(dto.scaleId);
    if (!scaleReading.isStable) {
      throw new BadRequestException('Scale reading unstable. Please ensure vehicle is completely stationary.');
    }

    const digitalSealPayload = `${loadId}:${scaleReading.weightKg}:${scaleReading.timestamp}`;
    const digitalSeal = this.digitalScaleProvider.generateDigitalSeal(digitalSealPayload);

    const [scaleRecord, updatedLoad] = await this.prisma.$transaction([
      this.prisma.scaleRecord.create({
        data: {
          loadId: load.id,
          recyclerId: recycler.id,
          scaleId: dto.scaleId,
          grossWeightKg: scaleReading.weightKg,
          tareWeightKg: 0,
          netWeightKg: 0,
          weighInTimestamp: new Date(scaleReading.timestamp),
          weighmasterName: recycler.facilityName,
          digitalSeal,
        },
      }),
      this.prisma.incomingLoad.update({
        where: { id: load.id },
        data: { status: LoadStatus.WEIGHING_IN },
      }),
    ]);

    this.logger.log(`Weigh-in recorded for load [${load.manifestNumber}]: Gross Weight = ${scaleReading.weightKg} kg`);

    return {
      success: true,
      statusCode: 200,
      message: 'Weigh-in recorded successfully.',
      data: { scaleRecord, loadStatus: updatedLoad.status },
      timestamp: new Date().toISOString(),
    };
  }

  async recordInspection(userId: string, loadId: string, dto: RecordInspectionDto) {
    const recycler = await this.getRecyclerProfile(userId);
    const load = await this.prisma.incomingLoad.findUnique({
      where: { id: loadId },
    });

    if (!load || load.recyclerId !== recycler.id) {
      throw new NotFoundException('Incoming load not found in this facility.');
    }

    if (load.status !== LoadStatus.WEIGHING_IN) {
      throw new BadRequestException(`Load must be in WEIGHING_IN status to inspect. Current status: ${load.status}`);
    }

    const inspection = await this.prisma.qualityInspection.create({
      data: {
        loadId: load.id,
        recyclerId: recycler.id,
        inspectorName: recycler.facilityName,
        overallGrade: dto.overallGrade,
        moisturePercent: dto.moisturePercent,
        contaminationRate: dto.contaminationRate,
        notes: dto.notes || null,
        contaminationFlags: {
          create: (dto.contaminants || []).map((c) => ({
            contaminantType: c.contaminantType,
            severity: c.severity || 'MEDIUM',
            estimatedWeightKg: c.estimatedWeightKg,
            actionTaken: c.actionTaken || 'SORTED_OUT',
            photoUrl: c.photoUrl || null,
          })),
        },
      },
      include: { contaminationFlags: true },
    });

    const newStatus =
      dto.overallGrade === InspectionGrade.REJECTED_HAZARDOUS
        ? LoadStatus.REJECTED
        : LoadStatus.INSPECTING;

    const updatedLoad = await this.prisma.incomingLoad.update({
      where: { id: load.id },
      data: { status: newStatus },
    });

    this.logger.log(`Inspection recorded for load [${load.manifestNumber}]: Grade = ${dto.overallGrade}`);

    return {
      success: true,
      statusCode: 201,
      message: 'Quality inspection recorded successfully.',
      data: { inspection, loadStatus: updatedLoad.status },
      timestamp: new Date().toISOString(),
    };
  }

  async recordWeighOut(userId: string, loadId: string, dto: RecordWeighOutDto) {
    const recycler = await this.getRecyclerProfile(userId);
    const load = await this.prisma.incomingLoad.findUnique({
      where: { id: loadId },
      include: { scaleRecord: true, qualityInspection: true },
    });

    if (!load || load.recyclerId !== recycler.id) {
      throw new NotFoundException('Incoming load not found in this facility.');
    }

    if (!load.scaleRecord) {
      throw new BadRequestException('Cannot weigh out without a prior weigh-in record.');
    }

    if (load.status === LoadStatus.REJECTED) {
      throw new BadRequestException('Load has been rejected during inspection.');
    }

    const scaleReading = await this.digitalScaleProvider.getScaleReading(dto.scaleId);
    // For tare weight, ensure it's less than gross weight (if simulated reading happens to be higher, cap tare weight)
    const tareWeightKg = Math.min(scaleReading.weightKg, Math.floor(load.scaleRecord.grossWeightKg * 0.35));
    const netWeightKg = load.scaleRecord.grossWeightKg - tareWeightKg;

    const digitalSealPayload = `${loadId}:${load.scaleRecord.grossWeightKg}:${tareWeightKg}:${netWeightKg}`;
    const digitalSeal = this.digitalScaleProvider.generateDigitalSeal(digitalSealPayload);

    const isContaminated = load.qualityInspection?.overallGrade === InspectionGrade.GRADE_C_HEAVY_SORT;
    const finalStatus = isContaminated ? LoadStatus.CONTAMINATED : LoadStatus.ACCEPTED;

    const [updatedScaleRecord, updatedLoad] = await this.prisma.$transaction([
      this.prisma.scaleRecord.update({
        where: { id: load.scaleRecord.id },
        data: {
          tareWeightKg,
          netWeightKg,
          weighOutTimestamp: new Date(),
          digitalSeal,
        },
      }),
      this.prisma.incomingLoad.update({
        where: { id: load.id },
        data: {
          status: finalStatus,
          departedAt: new Date(),
        },
      }),
    ]);

    this.logger.log(`Weigh-out recorded for load [${load.manifestNumber}]: Net Weight = ${netWeightKg} kg (${finalStatus})`);

    return {
      success: true,
      statusCode: 200,
      message: 'Weigh-out and net weight verification completed.',
      data: { scaleRecord: updatedScaleRecord, loadStatus: updatedLoad.status },
      timestamp: new Date().toISOString(),
    };
  }

  async getFacilityLoads(userId: string, status?: LoadStatus) {
    const recycler = await this.getRecyclerProfile(userId);
    const whereClause: any = { recyclerId: recycler.id };
    if (status) {
      whereClause.status = status;
    }

    const loads = await this.prisma.incomingLoad.findMany({
      where: whereClause,
      include: {
        scaleRecord: true,
        qualityInspection: { include: { contaminationFlags: true } },
      },
      orderBy: { actualArrival: 'desc' },
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Facility loads retrieved successfully.',
      data: loads,
      timestamp: new Date().toISOString(),
    };
  }
}
