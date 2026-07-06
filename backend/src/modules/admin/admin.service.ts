import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { PickupStatus, RoleType } from "@prisma/client";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics() {
    const totalUsers = await this.prisma.user.count({
      where: { role: { name: RoleType.USER } },
    });
    const totalCollectors = await this.prisma.collector.count();
    const totalPickups = await this.prisma.pickupRequest.count();
    const completedPickups = await this.prisma.pickupRequest.count({
      where: { status: PickupStatus.COMPLETED },
    });

    // Aggregate total weight and payouts from completed pickups
    const completedJobs = await this.prisma.pickupRequest.findMany({
      where: { status: PickupStatus.COMPLETED },
      select: {
        actualWeightKg: true,
        actualPayout: true,
        estimatedWeightKg: true,
        estimatedPayout: true,
      },
    });

    let totalWeightRecycledKg = 0;
    let totalPayoutsUSD = 0;

    for (const job of completedJobs) {
      totalWeightRecycledKg += job.actualWeightKg || job.estimatedWeightKg || 0;
      totalPayoutsUSD += job.actualPayout || job.estimatedPayout || 0;
    }

    // Average CO2 saved per kg recycled is approx 3.5 kg
    const totalCo2OffsetKg = Number((totalWeightRecycledKg * 3.5).toFixed(1));

    // Waste volume breakdown by category
    const categories = await this.prisma.wasteCategory.findMany({
      include: {
        pickupItems: {
          include: {
            pickupRequest: {
              select: {
                status: true,
                actualWeightKg: true,
                estimatedWeightKg: true,
              },
            },
          },
        },
      },
    });

    const categoryBreakdown = categories.map((cat) => {
      let catWeight = 0;
      for (const item of cat.pickupItems) {
        if (
          item.pickupRequest &&
          item.pickupRequest.status === PickupStatus.COMPLETED
        ) {
          catWeight += item.actualWeightKg || item.estimatedWeightKg || 0;
        }
      }
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        iconName: cat.iconName,
        totalWeightKg: Number(catWeight.toFixed(2)),
        percentage: 0, // calculated below
      };
    });

    const totalCatWeight =
      categoryBreakdown.reduce((sum, c) => sum + c.totalWeightKg, 0) || 1;
    for (const c of categoryBreakdown) {
      c.percentage = Math.round((c.totalWeightKg / totalCatWeight) * 100);
    }

    // Revenue estimation (Platform takes a 20% commission on waste value)
    const totalPlatformRevenueUSD = Number((totalPayoutsUSD * 1.25).toFixed(2));
    const netProfitUSD = Number(
      (totalPlatformRevenueUSD - totalPayoutsUSD).toFixed(2),
    );

    return {
      overview: {
        totalUsers,
        totalCollectors,
        totalPickups,
        completedPickups,
        totalWeightRecycledKg: Number(totalWeightRecycledKg.toFixed(2)),
        totalCo2OffsetKg,
        totalPlatformRevenueUSD,
        totalCollectorPayoutsUSD: Number(totalPayoutsUSD.toFixed(2)),
        netProfitUSD,
      },
      categoryBreakdown,
      timestamp: new Date().toISOString(),
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      include: {
        role: true,
        wallet: true,
        _count: { select: { pickupRequests: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getCollectors() {
    return this.prisma.collector.findMany({
      include: {
        user: {
          select: { fullName: true, email: true, phone: true, avatarUrl: true },
        },
        vehicles: true,
      },
      orderBy: { totalCompleted: "desc" },
    });
  }

  async getPickups() {
    return this.prisma.pickupRequest.findMany({
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        collector: {
          include: {
            user: { select: { fullName: true, phone: true } },
            vehicles: true,
          },
        },
        address: true,
        items: { include: { category: true } },
      },
      orderBy: { scheduledDate: "desc" },
    });
  }

  async getRevenueReport() {
    const transactions = await this.prisma.transaction.findMany({
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return {
      totalTransactions: transactions.length,
      transactions,
    };
  }
}
