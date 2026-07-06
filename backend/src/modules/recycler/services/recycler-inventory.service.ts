import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateMaterialBatchDto } from '../dto/recycler.dto';
import { BatchStatus } from '@prisma/client';

@Injectable()
export class RecyclerInventoryService {
  private readonly logger = new Logger(RecyclerInventoryService.name);

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

  async createBatch(userId: string, dto: CreateMaterialBatchDto) {
    const recycler = await this.getRecyclerProfile(userId);

    const category = await this.prisma.wasteCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Waste category [${dto.categoryId}] not found.`);
    }

    if (dto.loadId) {
      const load = await this.prisma.incomingLoad.findUnique({
        where: { id: dto.loadId },
      });
      if (!load || load.recyclerId !== recycler.id) {
        throw new NotFoundException('Incoming load not found in this facility.');
      }
    }

    const batchNumber = `BAT-${new Date().getFullYear()}-${category.slug.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.logger.log(`Creating material lot batch [${batchNumber}] for category [${category.name}]: ${dto.weightKg} kg`);

    const [batch, inventory] = await this.prisma.$transaction([
      this.prisma.materialBatch.create({
        data: {
          batchNumber,
          recyclerId: recycler.id,
          loadId: dto.loadId || null,
          categoryId: category.id,
          weightKg: dto.weightKg,
          purityPercent: 98.5,
          status: BatchStatus.RAW_INTAKE,
          warehouseLocation: dto.warehouseLocation || 'BAY-A1',
        },
        include: { category: true },
      }),
      this.prisma.warehouseInventory.upsert({
        where: {
          recyclerId_categoryId: {
            recyclerId: recycler.id,
            categoryId: category.id,
          },
        },
        update: {
          totalWeightKg: { increment: dto.weightKg },
          availableWeightKg: { increment: dto.weightKg },
          lastAuditedAt: new Date(),
        },
        create: {
          recyclerId: recycler.id,
          categoryId: category.id,
          totalWeightKg: dto.weightKg,
          availableWeightKg: dto.weightKg,
          allocatedWeightKg: 0,
          averagePurity: 98.5,
        },
        include: { category: true },
      }),
    ]);

    return {
      success: true,
      statusCode: 201,
      message: 'Material batch created and inventory updated successfully.',
      data: { batch, inventory },
      timestamp: new Date().toISOString(),
    };
  }

  async getInventory(userId: string) {
    const recycler = await this.getRecyclerProfile(userId);
    const inventory = await this.prisma.warehouseInventory.findMany({
      where: { recyclerId: recycler.id },
      include: { category: true },
      orderBy: { totalWeightKg: 'desc' },
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Warehouse inventory retrieved successfully.',
      data: inventory,
      timestamp: new Date().toISOString(),
    };
  }

  async getBatches(userId: string, status?: BatchStatus) {
    const recycler = await this.getRecyclerProfile(userId);
    const whereClause: any = { recyclerId: recycler.id };
    if (status) {
      whereClause.status = status;
    }

    const batches = await this.prisma.materialBatch.findMany({
      where: whereClause,
      include: { category: true, load: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Material batches retrieved successfully.',
      data: batches,
      timestamp: new Date().toISOString(),
    };
  }
}
