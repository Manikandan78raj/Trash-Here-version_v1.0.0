import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { GoogleMapsPolylineProvider } from "../providers/google-maps-polyline.provider";
import { NotificationsService } from "../../notifications/notifications.service";
import { WalletService } from "../../wallet/wallet.service";
import { CollectorLogisticsGateway } from "../gateways/collector-logistics.gateway";
import { GeofenceValidator } from "../domain/geofence.validator";
import { QrCryptoValidator } from "../domain/qr-crypto.validator";
import { UpdateLocationDto, CompleteJobDto } from "../dto/collectors.dto";
import {
  PickupStatus,
  NotificationPriority,
  NotificationCategory,
} from "@prisma/client";
import { RouteWaypoint } from "../providers/maps-route.provider.interface";

@Injectable()
export class CollectorLogisticsService {
  private readonly logger = new Logger(CollectorLogisticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mapsRouteProvider: GoogleMapsPolylineProvider,
    private readonly notificationsService: NotificationsService,
    private readonly walletService: WalletService,
    private readonly logisticsGateway: CollectorLogisticsGateway,
  ) {}

  async getAssignedRoute(userId: string) {
    const collector = await this.prisma.collector.findUnique({
      where: { userId },
    });
    if (!collector) {
      throw new NotFoundException(
        "Collector profile not found for current user.",
      );
    }

    const assignedJobs = await this.prisma.pickupRequest.findMany({
      where: {
        collectorId: collector.id,
        status: {
          in: [
            PickupStatus.ASSIGNED,
            PickupStatus.EN_ROUTE,
            PickupStatus.ARRIVED,
            PickupStatus.VERIFIED,
          ],
        },
      },
      include: {
        address: true,
        user: { select: { fullName: true, phone: true } },
      },
      orderBy: { scheduledDate: "asc" },
    });

    const waypoints: RouteWaypoint[] = assignedJobs.map((job, idx) => ({
      pickupId: job.id,
      order: idx + 1,
      lat: job.address.lat || 37.7749,
      lng: job.address.lng || -122.4194,
      address: `${job.address.street}, ${job.address.city}, ${job.address.state}`,
      customerName: job.user.fullName,
      status: job.status,
      estimatedWeightKg: job.estimatedWeightKg,
    }));

    const routeResult = await this.mapsRouteProvider.getOptimizedRoute(
      collector.currentLat || 37.7749,
      collector.currentLng || -122.4194,
      waypoints,
    );

    return {
      ...routeResult,
      collectorId: collector.id,
    };
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const collector = await this.prisma.collector.findUnique({
      where: { userId },
    });
    if (!collector) {
      throw new NotFoundException("Collector profile not found.");
    }

    const updated = await this.prisma.collector.update({
      where: { id: collector.id },
      data: {
        currentLat: dto.lat,
        currentLng: dto.lng,
      },
    });

    // Check if collector has an active job to broadcast location to its room
    const activeJob = await this.prisma.pickupRequest.findFirst({
      where: {
        collectorId: collector.id,
        status: { in: [PickupStatus.EN_ROUTE, PickupStatus.ARRIVED] },
      },
    });

    if (activeJob) {
      this.logisticsGateway.emitLocationUpdate(
        activeJob.id,
        dto.lat,
        dto.lng,
        collector.id,
      );
    }

    return updated;
  }

  async arriveAtStop(userId: string, pickupId: string) {
    const collector = await this.prisma.collector.findUnique({
      where: { userId },
    });
    if (!collector) {
      throw new NotFoundException("Collector profile not found.");
    }

    const job = await this.prisma.pickupRequest.findUnique({
      where: { id: pickupId },
      include: { user: true, address: true },
    });

    if (!job) {
      throw new NotFoundException("Pickup request not found.");
    }

    if (job.collectorId !== collector.id) {
      throw new BadRequestException("This pickup is not assigned to you.");
    }

    if (
      job.status === PickupStatus.COMPLETED ||
      job.status === PickupStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot mark arrived for job in status ${job.status}.`,
      );
    }

    const updatedJob = await this.prisma.pickupRequest.update({
      where: { id: pickupId },
      data: { status: PickupStatus.ARRIVED },
      include: {
        address: true,
        user: { select: { fullName: true, phone: true } },
      },
    });

    // Notify household customer
    await this.notificationsService.create({
      userId: job.userId,
      title: "🚛 Collector Arrived!",
      message: `Your collector has arrived at ${job.address.street}. Please present your bin QR code for verification.`,
      type: "PICKUP",
      priority: NotificationPriority.HIGH,
      category: NotificationCategory.PICKUP,
      actionUrl: `/app/pickups/${job.id}`,
    });

    this.logisticsGateway.emitJobStatusChange(job.id, PickupStatus.ARRIVED, {
      collectorName: collector.id,
      arrivedAt: new Date(),
    });

    this.logger.log(`🚛 Collector ${collector.id} arrived at stop ${job.id}`);
    return updatedJob;
  }

  async completePickupJob(
    userId: string,
    pickupId: string,
    dto: CompleteJobDto,
  ) {
    const collector = await this.prisma.collector.findUnique({
      where: { userId },
    });
    if (!collector) {
      throw new NotFoundException("Collector profile not found.");
    }

    const job = await this.prisma.pickupRequest.findUnique({
      where: { id: pickupId },
      include: { address: true, user: true },
    });

    if (!job) {
      throw new NotFoundException("Pickup request not found.");
    }

    if (job.collectorId !== collector.id) {
      throw new BadRequestException("This pickup is not assigned to you.");
    }

    if (job.status === PickupStatus.COMPLETED) {
      throw new BadRequestException("This pickup has already been completed.");
    }

    // 1. Verify Haversine GPS distance (max 100 meters)
    const targetLat = job.address.lat || 37.7749;
    const targetLng = job.address.lng || -122.4194;
    const geofenceResult = GeofenceValidator.verifyDistance(
      dto.lat,
      dto.lng,
      targetLat,
      targetLng,
      100,
    );

    // 2. Verify QR Code cryptographic token
    QrCryptoValidator.verifyQrSecret(dto.qrSecret, job.qrCodeSecret);

    // 3. Calculate financial payout & green points
    const actualPayout = Number((dto.actualWeightKg * 2.5).toFixed(2));
    const rewardPoints = Math.round(dto.actualWeightKg * 10);

    // 4. Execute atomic database transaction
    const completedJob = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.pickupRequest.update({
        where: { id: pickupId },
        data: {
          status: PickupStatus.COMPLETED,
          actualWeightKg: dto.actualWeightKg,
          actualPayout,
          rewardPoints,
          completedDate: new Date(),
        },
      });

      await tx.collector.update({
        where: { id: collector.id },
        data: {
          totalCompleted: { increment: 1 },
          totalEarnings: { increment: actualPayout },
          isAvailable: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: collector.userId,
          action: "COMPLETE_JOB",
          entity: "PickupRequest",
          entityId: pickupId,
          details: `Job verified via QR & Geofence (${geofenceResult.distanceMeters}m away). Payout: $${actualPayout}`,
        },
      });

      return updated;
    });

    // 5. Credit collector earnings and household points via WalletService
    await this.walletService.creditEarnings(
      collector.userId,
      actualPayout,
      0,
      `Collector earnings for pickup #${job.id.substring(0, 8)}`,
    );

    await this.walletService.creditEarnings(
      job.userId,
      0,
      rewardPoints,
      `Recycling reward points for completed pickup #${job.id.substring(0, 8)}`,
    );

    // 6. Notify household customer & broadcast real-time event
    await this.notificationsService.create({
      userId: job.userId,
      title: "🎉 Pickup Completed!",
      message: `We collected ${dto.actualWeightKg}kg of waste! You earned ${rewardPoints} Green Points!`,
      type: "REWARD",
      priority: NotificationPriority.HIGH,
      category: NotificationCategory.REWARD,
      actionUrl: `/app/rewards`,
    });

    this.logisticsGateway.emitJobStatusChange(job.id, PickupStatus.COMPLETED, {
      completedAt: new Date(),
      actualWeightKg: dto.actualWeightKg,
      rewardPoints,
    });

    this.logger.log(
      `✅ Collector ${collector.id} successfully completed job ${job.id}`,
    );
    return {
      success: true,
      message: "Pickup job completed! Earnings credited to your wallet.",
      job: completedJob,
      payout: actualPayout,
      geofenceDistanceMeters: geofenceResult.distanceMeters,
    };
  }
}
