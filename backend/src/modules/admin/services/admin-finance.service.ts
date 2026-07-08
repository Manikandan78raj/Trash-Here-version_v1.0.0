import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import {
  PnLSnapshot,
  IAdminFinanceProvider,
} from "../interfaces/admin.interface";
import { TransactionType, TransactionStatus } from "@prisma/client";

@Injectable()
export class AdminFinanceService implements IAdminFinanceProvider {
  constructor(private readonly prisma: PrismaService) {}

  async calculatePnL(startDate: Date, endDate: Date): Promise<PnLSnapshot> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: TransactionStatus.COMPLETED,
      },
    });

    const soldBatches = await this.prisma.materialBatch.findMany({
      where: {
        status: "SOLD",
      },
      include: { category: true },
    });

    let stripePaymentsUsd = 0;
    let collectorPayoutsUsd = 0;
    let rewardsLiabilitiesUsd = 0;

    for (const tx of transactions) {
      if (tx.type === TransactionType.PAYMENT) {
        stripePaymentsUsd += tx.amount;
      } else if (tx.type === TransactionType.PAYOUT) {
        collectorPayoutsUsd += tx.amount;
      }
      if (tx.pointsAmount && tx.pointsAmount > 0) {
        rewardsLiabilitiesUsd += tx.pointsAmount * 0.01; // $0.01 per point liability
      }
    }

    let recyclerInvoicesUsd = 0;
    for (const batch of soldBatches) {
      const price = batch.category?.pricePerKg || 0.5;
      recyclerInvoicesUsd += batch.weightKg * price;
    }

    const grossRevenueUsd = stripePaymentsUsd + recyclerInvoicesUsd;
    const netMarginUsd =
      grossRevenueUsd - collectorPayoutsUsd - rewardsLiabilitiesUsd;

    return {
      period: `${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`,
      grossRevenueUsd: Math.round(grossRevenueUsd * 100) / 100,
      stripePaymentsUsd: Math.round(stripePaymentsUsd * 100) / 100,
      recyclerInvoicesUsd: Math.round(recyclerInvoicesUsd * 100) / 100,
      collectorPayoutsUsd: Math.round(collectorPayoutsUsd * 100) / 100,
      rewardsLiabilitiesUsd: Math.round(rewardsLiabilitiesUsd * 100) / 100,
      netMarginUsd: Math.round(netMarginUsd * 100) / 100,
      totalTransactions: transactions.length + soldBatches.length,
      reconciledAt: new Date(),
    };
  }

  async reconcileLedgers(): Promise<{
    success: boolean;
    discrepanciesFound: number;
    details: string[];
  }> {
    const wallets = await this.prisma.wallet.findMany();
    const transactions = await this.prisma.transaction.findMany({
      where: { status: TransactionStatus.COMPLETED },
    });

    let discrepanciesFound = 0;
    const details: string[] = [];

    const userTxMap = new Map<string, { cash: number; points: number }>();

    for (const tx of transactions) {
      if (!userTxMap.has(tx.userId)) {
        userTxMap.set(tx.userId, { cash: 0, points: 0 });
      }
      const agg = userTxMap.get(tx.userId)!;
      if (tx.type === TransactionType.PAYMENT) {
        agg.cash += tx.amount;
      } else if (tx.type === TransactionType.PAYOUT) {
        agg.cash -= tx.amount;
      }
      if (tx.pointsAmount) {
        agg.points += tx.pointsAmount;
      }
    }

    for (const wallet of wallets) {
      const agg = userTxMap.get(wallet.userId) || { cash: 0, points: 0 };
      if (Math.abs(wallet.cashBalance - agg.cash) > 0.01) {
        discrepanciesFound++;
        details.push(
          `Wallet ${wallet.id} (User ${wallet.userId}) cash balance ${wallet.cashBalance} deviates from transaction net ${agg.cash}`,
        );
      }
    }

    return {
      success: discrepanciesFound === 0,
      discrepanciesFound,
      details,
    };
  }
}
