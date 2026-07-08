import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateDispatchOrderDto, ReassignRouteDto } from "../dto/admin.dto";
import {
  DispatchScoreInput,
  DispatchScoreResult,
} from "../interfaces/admin.interface";
import { DispatchStatus, PickupStatus } from "@prisma/client";

@Injectable()
export class AdminFleetService {
  constructor(private readonly prisma: PrismaService) {}

  async getLiveFleetMap() {
    const collectors = await this.prisma.collector.findMany({
      where: { isOnline: true },
      include: {
        user: { select: { fullName: true, phone: true } },
        vehicles: { where: { isActive: true } },
        assignedPickups: {
          where: {
            status: {
              in: [
                PickupStatus.ASSIGNED,
                PickupStatus.EN_ROUTE,
                PickupStatus.ARRIVED,
              ],
            },
          },
          include: { address: true },
        },
      },
    });

    return collectors.map((c) => ({
      collectorId: c.id,
      userId: c.userId,
      driverName: c.user?.fullName || "Unknown Driver",
      phone: c.user?.phone || "N/A",
      rating: c.rating,
      isAvailable: c.isAvailable,
      currentLat: c.currentLat || 37.7749,
      currentLng: c.currentLng || -122.4194,
      vehiclePlate: c.vehicles?.[0]?.licensePlate || "NO-PLATE",
      capacityKg: c.vehicles?.[0]?.capacityKg || 1000,
      activePickupsCount: c.assignedPickups.length,
      activePickups: c.assignedPickups,
    }));
  }

  calculateScore(input: DispatchScoreInput): DispatchScoreResult {
    if (!input.isAvailable) {
      return {
        collectorId: input.collectorId,
        score: 0,
        distanceKm: 999,
        estimatedEtaMinutes: 999,
        isEligible: false,
        rejectionReason: "Collector is offline or unavailable",
      };
    }

    if (input.currentLoadKg + input.estimatedWeightKg > input.maxCapacityKg) {
      return {
        collectorId: input.collectorId,
        score: 0,
        distanceKm: 999,
        estimatedEtaMinutes: 999,
        isEligible: false,
        rejectionReason:
          "Capacity exceeded: vehicle cannot hold estimated load weight",
      };
    }

    // Euclidean distance approximation for dispatch algorithm
    const dLat = (input.pickupLat - input.currentLat) * 111.0;
    const dLng = (input.pickupLng - input.currentLng) * 85.0;
    const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng);
    const estimatedEtaMinutes = Math.round((distanceKm / 30.0) * 60.0) + 2; // Assuming 30 km/h average speed

    // Algorithm score: 100 - (distance * 5) + (rating * 5)
    let score = 100 - distanceKm * 5.0 + input.rating * 5.0;
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return {
      collectorId: input.collectorId,
      score: Math.round(score * 10) / 10,
      distanceKm: Math.round(distanceKm * 100) / 100,
      estimatedEtaMinutes,
      isEligible: true,
    };
  }

  async createDispatchOrder(dto: CreateDispatchOrderDto) {
    const pickup = await this.prisma.pickupRequest.findUnique({
      where: { id: dto.pickupRequestId },
      include: { address: true },
    });
    if (!pickup) {
      throw new NotFoundException(
        `Pickup request ${dto.pickupRequestId} not found`,
      );
    }

    let targetCollectorId = dto.collectorId;
    let score = 0.0;

    if (!targetCollectorId) {
      const collectors = await this.prisma.collector.findMany({
        where: { isOnline: true, isAvailable: true },
        include: { vehicles: { where: { isActive: true } } },
      });

      let highestScoring: DispatchScoreResult | null = null;
      for (const col of collectors) {
        const res = this.calculateScore({
          collectorId: col.id,
          currentLat: col.currentLat || 37.7749,
          currentLng: col.currentLng || -122.4194,
          rating: col.rating,
          isAvailable: col.isAvailable,
          maxCapacityKg: col.vehicles?.[0]?.capacityKg || 1000,
          currentLoadKg: 0, // Estimated current load
          pickupLat: pickup.address.lat,
          pickupLng: pickup.address.lng,
          estimatedWeightKg: pickup.estimatedWeightKg,
        });

        if (
          res.isEligible &&
          (!highestScoring || res.score > highestScoring.score)
        ) {
          highestScoring = res;
        }
      }

      if (highestScoring) {
        targetCollectorId = highestScoring.collectorId;
        score = highestScoring.score;
      }
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (dto.ttlSeconds || 30));

    return this.prisma.dispatchOrder.create({
      data: {
        pickupRequestId: dto.pickupRequestId,
        collectorId: targetCollectorId,
        status: DispatchStatus.OFFERED,
        dispatchScore: score,
        expiresAt,
      },
      include: { collector: { include: { user: true } }, pickupRequest: true },
    });
  }

  async reassignRoute(dto: ReassignRouteDto) {
    const pickup = await this.prisma.pickupRequest.findUnique({
      where: { id: dto.pickupRequestId },
    });
    if (!pickup) {
      throw new NotFoundException(
        `Pickup request ${dto.pickupRequestId} not found`,
      );
    }

    const newCollector = await this.prisma.collector.findUnique({
      where: { id: dto.newCollectorId },
    });
    if (!newCollector) {
      throw new NotFoundException(`Collector ${dto.newCollectorId} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.dispatchOrder.updateMany({
        where: {
          pickupRequestId: dto.pickupRequestId,
          status: {
            in: [
              DispatchStatus.QUEUED,
              DispatchStatus.OFFERED,
              DispatchStatus.ACCEPTED,
            ],
          },
        },
        data: { status: DispatchStatus.CANCELLED },
      });

      return tx.pickupRequest.update({
        where: { id: dto.pickupRequestId },
        data: {
          collectorId: dto.newCollectorId,
          status: PickupStatus.ASSIGNED,
          notes: `Reassigned by dispatcher: ${dto.reason}`,
        },
      });
    });
  }
}
