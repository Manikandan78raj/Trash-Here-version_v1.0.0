import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import {
  CreatePickupDto,
  UpdatePickupStatusDto,
  VerifyPickupQrDto,
} from "./dto/pickups.dto";
import { PickupStatus, TransactionType } from "@prisma/client";

@Injectable()
export class PickupsService {
  private readonly logger = new Logger(PickupsService.name);

  constructor(private prisma: PrismaService) {}

  async createPickup(userId: string, dto: CreatePickupDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });
    if (!address)
      throw new NotFoundException(
        "Address not found or does not belong to user",
      );

    let totalWeightKg = 0;
    let totalEstimatedPayout = 0;
    let totalRewardPoints = 0;

    for (const item of dto.items) {
      const category = await this.prisma.wasteCategory.findUnique({
        where: { id: item.categoryId },
      });
      if (!category)
        throw new BadRequestException(
          `Waste category ${item.categoryId} not found`,
        );

      totalWeightKg += item.estimatedWeightKg;
      totalEstimatedPayout += item.estimatedWeightKg * category.pricePerKg;
      totalRewardPoints += Math.round(
        item.estimatedWeightKg * category.pointMultiplier,
      );
    }

    // Smart auto-assignment: find an available online collector
    const availableCollector = await this.prisma.collector.findFirst({
      where: { isOnline: true, isAvailable: true },
      orderBy: { rating: "desc" },
    });

    const status = availableCollector
      ? PickupStatus.ASSIGNED
      : PickupStatus.PENDING;
    const collectorId = availableCollector ? availableCollector.id : null;

    if (availableCollector) {
      this.logger.log(
        `🤖 [AI Matchmaker] Assigned Pickup to Collector: ${availableCollector.id}`,
      );
    }

    const pickupRequest = await this.prisma.pickupRequest.create({
      data: {
        userId,
        collectorId,
        addressId: dto.addressId,
        status,
        scheduledDate: new Date(dto.scheduledDate),
        estimatedWeightKg: Number(totalWeightKg.toFixed(2)),
        rewardPoints: totalRewardPoints,
        estimatedPayout: Number(totalEstimatedPayout.toFixed(2)),
        aiVerified: true,
        notes: dto.notes,
        items: {
          create: dto.items.map((i) => ({
            categoryId: i.categoryId,
            estimatedWeightKg: i.estimatedWeightKg,
            photoUrl:
              i.photoUrl ||
              "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500",
            aiConfidence: i.aiConfidence || 0.95,
          })),
        },
      },
      include: {
        items: { include: { category: true } },
        address: true,
        collector: { include: { user: true, vehicles: true } },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        title: "Pickup Scheduled! 🚛",
        message: `Your pickup request has been scheduled for ${new Date(dto.scheduledDate).toLocaleDateString()}.`,
        type: "PICKUP",
        linkUrl: `/app/pickups/${pickupRequest.id}`,
      },
    });

    return pickupRequest;
  }

  async getUserPickups(userId: string) {
    return this.prisma.pickupRequest.findMany({
      where: { userId },
      include: {
        items: { include: { category: true } },
        address: true,
        collector: { include: { user: true, vehicles: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPickupById(id: string) {
    const pickup = await this.prisma.pickupRequest.findUnique({
      where: { id },
      include: {
        items: { include: { category: true } },
        address: true,
        collector: { include: { user: true, vehicles: true } },
        user: true,
      },
    });
    if (!pickup) throw new NotFoundException("Pickup request not found");
    return pickup;
  }

  async updateStatus(id: string, dto: UpdatePickupStatusDto) {
    const pickup = await this.prisma.pickupRequest.findUnique({
      where: { id },
    });
    if (!pickup) throw new NotFoundException("Pickup request not found");

    return this.prisma.pickupRequest.update({
      where: { id },
      data: { status: dto.status },
      include: {
        items: { include: { category: true } },
        address: true,
        collector: { include: { user: true, vehicles: true } },
      },
    });
  }

  async cancelPickup(userId: string, id: string, reason?: string) {
    const pickup = await this.prisma.pickupRequest.findFirst({
      where: { id, userId },
    });
    if (!pickup) throw new NotFoundException("Pickup request not found");

    if (
      (
        [
          PickupStatus.ARRIVED,
          PickupStatus.VERIFIED,
          PickupStatus.COMPLETED,
          PickupStatus.CANCELLED,
        ] as PickupStatus[]
      ).includes(pickup.status)
    ) {
      throw new BadRequestException(
        "Cannot cancel pickup after collector has arrived or if already completed/cancelled",
      );
    }

    this.logger.log(
      `🚫 [Pickup Cancelled] User ${userId} cancelled pickup ${id}. Reason: ${reason || "None"}`,
    );

    const cancelledPickup = await this.prisma.pickupRequest.update({
      where: { id },
      data: {
        status: PickupStatus.CANCELLED,
        notes: reason
          ? `[CANCELLED: ${reason}] ${pickup.notes || ""}`
          : pickup.notes,
      },
      include: {
        items: { include: { category: true } },
        address: true,
        collector: { include: { user: true, vehicles: true } },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        title: "Pickup Cancelled 🚫",
        message: `Your pickup #${id.slice(0, 8)} has been cancelled.`,
        type: "ALERT",
        linkUrl: "/app/dashboard",
      },
    });

    return cancelledPickup;
  }

  async simulateStatus(id: string, status: PickupStatus) {
    const pickup = await this.prisma.pickupRequest.findUnique({
      where: { id },
    });
    if (!pickup) throw new NotFoundException("Pickup request not found");

    this.logger.log(
      `🧪 [Telemetry Simulation] Changing pickup ${id} status to ${status}`,
    );

    let collectorId = pickup.collectorId;
    if (!collectorId && status !== PickupStatus.PENDING) {
      const availableCollector = await this.prisma.collector.findFirst({
        where: { isAvailable: true },
        orderBy: { rating: "desc" },
      });
      const anyCollector =
        availableCollector || (await this.prisma.collector.findFirst());
      if (anyCollector) {
        collectorId = anyCollector.id;
        this.logger.log(
          `🤖 [Telemetry Simulation] Attached Collector: ${collectorId} to Pickup ${id}`,
        );
      }
    }

    const updatedPickup = await this.prisma.pickupRequest.update({
      where: { id },
      data: { status, collectorId },
      include: {
        items: { include: { category: true } },
        address: true,
        collector: { include: { user: true, vehicles: true } },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: pickup.userId,
        title: `Pickup Status Update: ${status} 📍`,
        message: `Your pickup #${id.slice(0, 8)} is now ${status}.`,
        type: "PICKUP",
        linkUrl: `/app/pickups/${id}`,
      },
    });

    return updatedPickup;
  }

  async verifyQrAndComplete(collectorUserId: string, dto: VerifyPickupQrDto) {
    const pickup = await this.prisma.pickupRequest.findFirst({
      where: { qrCodeSecret: dto.qrCodeSecret },
      include: { items: { include: { category: true } }, user: true },
    });

    if (!pickup)
      throw new NotFoundException("Invalid QR Code. No matching pickup found.");
    if (pickup.status === PickupStatus.COMPLETED) {
      throw new BadRequestException(
        "This pickup has already been verified and completed.",
      );
    }

    // Look up collector by caller ID, or fallback to pickup assigned collector, or any available collector
    let collector = await this.prisma.collector.findUnique({
      where: { userId: collectorUserId },
    });
    if (!collector && pickup.collectorId) {
      collector = await this.prisma.collector.findUnique({
        where: { id: pickup.collectorId },
      });
    }
    if (!collector) {
      collector = await this.prisma.collector.findFirst();
    }

    // Calculate actual payout and reward points based on verified actual weight
    const weightRatio = dto.actualWeightKg / (pickup.estimatedWeightKg || 1);
    const actualPayout = Number(
      (pickup.estimatedPayout * weightRatio).toFixed(2),
    );
    const actualPoints = Math.round(pickup.rewardPoints * weightRatio);

    const completedPickup = await this.prisma.$transaction(async (tx) => {
      // 1. Update pickup status
      const updated = await tx.pickupRequest.update({
        where: { id: pickup.id },
        data: {
          status: PickupStatus.COMPLETED,
          completedDate: new Date(),
          actualWeightKg: dto.actualWeightKg,
          actualPayout,
          rewardPoints: actualPoints,
        },
        include: { items: { include: { category: true } }, address: true },
      });

      // 2. Award Green Points to customer wallet
      await tx.wallet.update({
        where: { userId: pickup.userId },
        data: {
          pointsBalance: { increment: actualPoints },
          totalPointsEarned: { increment: actualPoints },
        },
      });

      // 3 & 4. Award cash earnings and stats to collector if one exists
      if (collector) {
        await tx.wallet.update({
          where: { userId: collector.userId },
          data: {
            cashBalance: { increment: actualPayout },
            totalCashEarned: { increment: actualPayout },
          },
        });

        await tx.collector.update({
          where: { id: collector.id },
          data: {
            totalCompleted: { increment: 1 },
            totalEarnings: { increment: actualPayout },
          },
        });
      }

      // 5. Update user eco score & carbon saved (avg 3.5 kg CO2 per kg recycled)
      const co2Saved = Number((dto.actualWeightKg * 3.5).toFixed(2));
      await tx.user.update({
        where: { id: pickup.userId },
        data: {
          ecoScore: { increment: Math.round(actualPoints / 5) },
          carbonSavedKg: { increment: co2Saved },
        },
      });

      // 6. Record transaction history
      await tx.transaction.create({
        data: {
          userId: pickup.userId,
          pickupRequestId: pickup.id,
          amount: actualPoints,
          type: TransactionType.BONUS,
          description: `Verified pickup completion: +${actualPoints} Green Points (${dto.actualWeightKg} kg recycled)`,
        },
      });

      // 7. Generate completion notification
      await tx.notification.create({
        data: {
          userId: pickup.userId,
          title: "Pickup Completed & Rewards Awarded! 🎉",
          message: `Your pickup #${pickup.id.slice(0, 8)} was verified (${dto.actualWeightKg} kg). You earned +${actualPoints} Green Points!`,
          type: "REWARD",
          linkUrl: "/app/rewards",
        },
      });

      return updated;
    });

    this.logger.log(
      `🎉 [QR Verified] Pickup ${pickup.id} completed! Customer earned ${actualPoints} pts, Collector earned $${actualPayout}`,
    );
    return completedPickup;
  }
}
