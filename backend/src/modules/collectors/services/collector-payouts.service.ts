import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { WalletService } from "../../wallet/wallet.service";
import { StripeConnectProvider } from "../providers/stripe-connect.provider";
import { InstantPayoutDto } from "../dto/collectors.dto";

@Injectable()
export class CollectorPayoutsService {
  private readonly logger = new Logger(CollectorPayoutsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly stripeConnectProvider: StripeConnectProvider,
  ) {}

  async getEarningsSummary(userId: string) {
    const collector = await this.prisma.collector.findUnique({
      where: { userId },
    });
    if (!collector) {
      throw new NotFoundException("Collector profile not found.");
    }

    const wallet = await this.walletService.getWallet(userId);
    const recentPayouts = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: { in: ["PAYOUT", "BONUS"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return {
      collectorId: collector.id,
      totalEarnings: collector.totalEarnings,
      currentCashBalance: wallet.cashBalance,
      instantPayoutsEnabled: collector.instantPayoutsEnabled,
      bankAccountLast4: collector.bankAccountLast4,
      stripeConnectId: collector.stripeConnectId,
      recentPayouts,
    };
  }

  async requestInstantPayout(userId: string, dto: InstantPayoutDto) {
    const collector = await this.prisma.collector.findUnique({
      where: { userId },
    });
    if (!collector) {
      throw new NotFoundException("Collector profile not found.");
    }

    if (!collector.instantPayoutsEnabled) {
      throw new BadRequestException(
        "Instant payouts are currently disabled for your account. Please contact support.",
      );
    }

    const wallet = await this.walletService.getWallet(userId);
    if (wallet.cashBalance < dto.amount) {
      throw new BadRequestException(
        `Insufficient cash balance. Available balance: $${wallet.cashBalance.toFixed(2)}, Requested: $${dto.amount.toFixed(2)}`,
      );
    }

    // 1. Invoke Stripe Connect transfer via OCP provider
    const amountCents = Math.round(dto.amount * 100);
    const destinationAccount = collector.stripeConnectId || "acct_1032D8299381";
    const transferResult =
      await this.stripeConnectProvider.createInstantTransfer(
        collector.id,
        amountCents,
        "usd",
        destinationAccount,
      );

    // 2. Deduct balance from wallet via reusable WalletService
    const withdrawResult = await this.walletService.withdrawCash(userId, {
      amount: dto.amount,
    });

    // 3. Create immutable audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "INSTANT_PAYOUT",
        entity: "Wallet",
        entityId: wallet.id,
        details: `Transferred $${dto.amount.toFixed(2)} to Stripe Connect account ${destinationAccount} (Transfer: ${transferResult.transferId})`,
      },
    });

    this.logger.log(
      `💸 Collector ${collector.id} completed instant payout of $${dto.amount.toFixed(2)}`,
    );

    return {
      success: true,
      message: `Instant payout of $${dto.amount.toFixed(2)} successfully sent to your bank account ending in ${collector.bankAccountLast4}.`,
      transferId: transferResult.transferId,
      destinationAccount,
      remainingCashBalance: withdrawResult.remainingCashBalance,
      transaction: withdrawResult.transaction,
    };
  }
}
