import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { UpdateLocationDto, ToggleStatusDto } from "./dto/collectors.dto";
import { PickupStatus } from "@prisma/client";

@Injectable()
export class CollectorsService {
  private readonly logger = new Logger(CollectorsService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const collector = await this.prisma.collector.findUnique({
      where: { userId },
      include: {
        vehicles: true,
        user: {
          select: { fullName: true, avatarUrl: true, email: true, phone: true },
        },
      },
    });

    if (!collector)
      throw new NotFoundException(
        "Collector profile not found for current user",
      );

    const activeJob = await this.prisma.pickupRequest.findFirst({
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
        items: { include: { category: true } },
        address: true,
        user: { select: { fullName: true, phone: true, avatarUrl: true } },
      },
    });

    const recentEarnings = await this.prisma.transaction.findMany({
      where: { userId: collector.userId, type: "BONUS" },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return {
      profile: collector,
      activeJob: activeJob || null,
      stats: {
        totalEarnings: collector.totalEarnings,
        totalCompleted: collector.totalCompleted,
        rating: collector.rating,
        isOnline: collector.isOnline,
        isAvailable: collector.isAvailable,
      },
      recentEarnings,
    };
  }

  async getAvailableJobs(lat?: number, lng?: number, radiusKm: number = 25) {
    // In production, we would use PostGIS or Haversine distance query.
    // For our enterprise starter, we return all PENDING jobs with simulated distance calculation!
    const pendingJobs = await this.prisma.pickupRequest.findMany({
      where: { status: PickupStatus.PENDING },
      include: {
        items: { include: { category: true } },
        address: true,
        user: { select: { fullName: true, avatarUrl: true, ecoScore: true } },
      },
      orderBy: { estimatedPayout: "desc" },
    });

    return pendingJobs.map((job) => {
      // Simulate distance between collector coordinates and customer address
      const dist =
        lat && lng && job.address.lat && job.address.lng
          ? Number(
              (
                Math.sqrt(
                  Math.pow(lat - job.address.lat, 2) +
                    Math.pow(lng - job.address.lng, 2),
                ) * 111
              ).toFixed(1),
            )
          : 3.4; // default simulated distance in km

      return {
        ...job,
        distanceKm: dist,
        estimatedDurationMin: Math.round(dist * 3 + 10),
      };
    });
  }

  async acceptJob(userId: string, pickupId: string) {
    const collector = await this.prisma.collector.findUnique({
      where: { userId },
    });
    if (!collector) throw new NotFoundException("Collector profile not found");

    const job = await this.prisma.pickupRequest.findUnique({
      where: { id: pickupId },
    });
    if (!job) throw new NotFoundException("Pickup job not found");
    if (
      job.status !== PickupStatus.PENDING &&
      job.collectorId !== collector.id
    ) {
      throw new BadRequestException(
        "This job is no longer available or already accepted by someone else",
      );
    }

    const acceptedJob = await this.prisma.$transaction(async (tx) => {
      const updatedJob = await tx.pickupRequest.update({
        where: { id: pickupId },
        data: {
          collectorId: collector.id,
          status: PickupStatus.ASSIGNED,
        },
        include: {
          items: { include: { category: true } },
          address: true,
          user: { select: { fullName: true, phone: true } },
        },
      });

      await tx.collector.update({
        where: { id: collector.id },
        data: { isAvailable: false },
      });

      return updatedJob;
    });

    this.logger.log(
      `🚛 Collector ${collector.id} accepted Pickup Job: ${pickupId}`,
    );
    return acceptedJob;
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const collector = await this.prisma.collector.findUnique({
      where: { userId },
    });
    if (!collector) throw new NotFoundException("Collector profile not found");

    return this.prisma.collector.update({
      where: { id: collector.id },
      data: {
        currentLat: dto.lat,
        currentLng: dto.lng,
      },
    });
  }

  async toggleOnlineStatus(userId: string, dto: ToggleStatusDto) {
    const collector = await this.prisma.collector.findUnique({
      where: { userId },
    });
    if (!collector) throw new NotFoundException("Collector profile not found");

    return this.prisma.collector.update({
      where: { id: collector.id },
      data: { isOnline: dto.isOnline },
    });
  }
}
