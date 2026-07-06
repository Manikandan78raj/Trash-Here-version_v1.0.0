import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { StartProcessingDto, CompleteProcessingDto } from '../dto/recycler.dto';
import { ProcessingStatus, BatchStatus, ProcessingStage } from '@prisma/client';

@Injectable()
export class RecyclerProcessingService {
  private readonly logger = new Logger(RecyclerProcessingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getRecyclerProfile(userId: string) {
    const profile = await this.prisma.recyclerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Recycler profile not found for current user.');
    }
    return profile;
  }

  async startProcessing(userId: string, dto: StartProcessingDto) {
    const recycler = await this.getRecyclerProfile(userId);
    const batch = await this.prisma.materialBatch.findUnique({
      where: { id: dto.batchId },
      include: { category: true },
    });

    if (!batch || batch.recyclerId !== recycler.id) {
      throw new NotFoundException('Material batch not found in this facility.');
    }

    const inventory = await this.prisma.warehouseInventory.findUnique({
      where: {
        recyclerId_categoryId: {
          recyclerId: recycler.id,
          categoryId: batch.categoryId,
        },
      },
    });

    if (!inventory || inventory.availableWeightKg < dto.inputWeightKg) {
      throw new BadRequestException(
        `Insufficient available inventory for processing. Requested: ${dto.inputWeightKg} kg, Available: ${inventory?.availableWeightKg || 0} kg`,
      );
    }

    const batchStatusMap: Record<ProcessingStage, BatchStatus> = {
      SORTING: BatchStatus.IN_SORTING,
      SHREDDING: BatchStatus.SHREDDING,
      WASHING: BatchStatus.WASHING,
      PELLETIZING: BatchStatus.PELLETIZING,
      COMPACTING: BatchStatus.READY_FOR_SALE,
      BALING: BatchStatus.READY_FOR_SALE,
    };

    const newBatchStatus = batchStatusMap[dto.processStage] || BatchStatus.IN_SORTING;

    this.logger.log(`Starting [${dto.processStage}] on machine [${dto.machineId}] for batch [${batch.batchNumber}]: ${dto.inputWeightKg} kg`);

    const [queueItem, updatedBatch, updatedInventory] = await this.prisma.$transaction([
      this.prisma.processingQueue.create({
        data: {
          recyclerId: recycler.id,
          batchId: batch.id,
          machineId: dto.machineId,
          processStage: dto.processStage,
          status: ProcessingStatus.IN_PROGRESS,
          inputWeightKg: dto.inputWeightKg,
          operatorName: recycler.facilityName,
          startedAt: new Date(),
        },
        include: { batch: { include: { category: true } } },
      }),
      this.prisma.materialBatch.update({
        where: { id: batch.id },
        data: { status: newBatchStatus },
      }),
      this.prisma.warehouseInventory.update({
        where: { id: inventory.id },
        data: {
          availableWeightKg: { decrement: dto.inputWeightKg },
          allocatedWeightKg: { increment: dto.inputWeightKg },
        },
      }),
    ]);

    return {
      success: true,
      statusCode: 201,
      message: 'Manufacturing process started successfully.',
      data: { queueItem, batchStatus: updatedBatch.status, availableWeightKg: updatedInventory.availableWeightKg },
      timestamp: new Date().toISOString(),
    };
  }

  async completeProcessing(userId: string, queueId: string, dto: CompleteProcessingDto) {
    const recycler = await this.getRecyclerProfile(userId);
    const queueItem = await this.prisma.processingQueue.findUnique({
      where: { id: queueId },
      include: { batch: true },
    });

    if (!queueItem || queueItem.recyclerId !== recycler.id) {
      throw new NotFoundException('Processing queue item not found.');
    }

    if (queueItem.status !== ProcessingStatus.IN_PROGRESS) {
      throw new BadRequestException(`Queue item must be IN_PROGRESS to complete. Current status: ${queueItem.status}`);
    }

    if (dto.outputWeightKg + dto.wasteLossKg > queueItem.inputWeightKg + 0.1) {
      throw new BadRequestException('Output weight + waste loss cannot exceed total input weight.');
    }

    const inventory = await this.prisma.warehouseInventory.findUnique({
      where: {
        recyclerId_categoryId: {
          recyclerId: recycler.id,
          categoryId: queueItem.batch.categoryId,
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException('Associated warehouse inventory not found.');
    }

    this.logger.log(`Completing queue item [${queueId}]: Output = ${dto.outputWeightKg} kg, Waste Loss = ${dto.wasteLossKg} kg`);

    const [updatedQueueItem, updatedBatch, updatedInventory] = await this.prisma.$transaction([
      this.prisma.processingQueue.update({
        where: { id: queueItem.id },
        data: {
          status: ProcessingStatus.COMPLETED,
          outputWeightKg: dto.outputWeightKg,
          wasteLossKg: dto.wasteLossKg,
          completedAt: new Date(),
        },
      }),
      this.prisma.materialBatch.update({
        where: { id: queueItem.batchId },
        data: {
          status: BatchStatus.READY_FOR_SALE,
          processedAt: new Date(),
        },
      }),
      this.prisma.warehouseInventory.update({
        where: { id: inventory.id },
        data: {
          allocatedWeightKg: { decrement: queueItem.inputWeightKg },
          availableWeightKg: { increment: dto.outputWeightKg },
          totalWeightKg: { decrement: dto.wasteLossKg },
          lastAuditedAt: new Date(),
        },
      }),
    ]);

    return {
      success: true,
      statusCode: 200,
      message: 'Processing completed and inventory updated.',
      data: {
        queueItem: updatedQueueItem,
        batchStatus: updatedBatch.status,
        inventory: updatedInventory,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getQueueItems(userId: string, status?: ProcessingStatus) {
    const recycler = await this.getRecyclerProfile(userId);
    const whereClause: any = { recyclerId: recycler.id };
    if (status) {
      whereClause.status = status;
    }

    const queueItems = await this.prisma.processingQueue.findMany({
      where: whereClause,
      include: { batch: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Processing queue retrieved successfully.',
      data: queueItems,
      timestamp: new Date().toISOString(),
    };
  }
}
