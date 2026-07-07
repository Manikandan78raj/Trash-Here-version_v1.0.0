import {
  Injectable,
  Optional,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisCacheService } from "../../common/cache/redis-cache.service";
import { Cacheable, CacheEvict } from "../../common/cache/cache.decorators";
import {
  RedeemRewardDto,
  WithdrawCashDto,
  CreateSubscriptionDto,
  CancelSubscriptionDto,
  ProcessCheckoutDto,
  ProcessRefundDto,
  ClaimReferralDto,
  ValidateCouponDto,
  SubscriptionPlanName,
} from "./dto/wallet.dto";
import { TransactionType, TransactionStatus } from "@prisma/client";

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private prisma: PrismaService,
    @Optional() public readonly cacheService?: RedisCacheService,
  ) {}

  async getWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          pointsBalance: 500,
          cashBalance: 0.0,
          totalPointsEarned: 500,
          totalCashEarned: 0.0,
        },
      });
    }
    return wallet;
  }

  @Cacheable({ keyPrefix: "wallet:dashboard", ttl: 60 })
  async getWalletDashboard(userId: string) {
    const wallet = await this.getWallet(userId);
    const [activeSubscription, recentTransactions, activeVouchers, user] =
      await Promise.all([
        this.prisma.subscription.findFirst({
          where: { userId, status: "ACTIVE" },
        }),
        this.prisma.transaction.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        this.prisma.userReward.findMany({
          where: { userId, status: "ACTIVE" },
          include: { reward: true },
        }),
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { ecoScore: true, carbonSavedKg: true, referralCode: true },
        }),
      ]);

    return {
      wallet,
      activeSubscription,
      recentTransactions,
      activeVouchers,
      stats: {
        ecoScore: user?.ecoScore || 100,
        carbonSavedKg: user?.carbonSavedKg || 0.0,
        referralCode: user?.referralCode || "",
      },
    };
  }

  @Cacheable({ keyPrefix: "wallet:rewards", ttl: 3600 })
  async getRewards() {
    return this.prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: "asc" },
    });
  }

  @CacheEvict({ keyPrefix: "wallet:dashboard", pattern: true })
  async redeemReward(userId: string, dto: RedeemRewardDto) {
    const wallet = await this.getWallet(userId);
    const reward = await this.prisma.reward.findUnique({
      where: { id: dto.rewardId },
    });

    if (!reward || !reward.isActive) {
      throw new NotFoundException(
        "Reward voucher not found or currently inactive",
      );
    }

    if (wallet.pointsBalance < reward.pointsCost) {
      throw new BadRequestException(
        `Insufficient Green Points. You need ${reward.pointsCost} points, but have ${wallet.pointsBalance}.`,
      );
    }

    const uniqueCode = `${reward.partnerName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-ECO`;

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { pointsBalance: { decrement: reward.pointsCost } },
      });

      await tx.reward.update({
        where: { id: reward.id },
        data: { redeemedCount: { increment: 1 } },
      });

      const userReward = await tx.userReward.create({
        data: {
          userId,
          rewardId: reward.id,
          redeemedCode: uniqueCode,
          pointsSpent: reward.pointsCost,
          status: "ACTIVE",
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: 0.0,
          pointsAmount: -reward.pointsCost,
          type: TransactionType.REWARD_REDEMPTION,
          status: TransactionStatus.COMPLETED,
          description: `Redeemed voucher: ${reward.title} (${reward.discountValue})`,
        },
      });

      this.logger.log(
        `🎁 User ${userId} redeemed reward ${reward.title} for ${reward.pointsCost} pts`,
      );

      return {
        success: true,
        message: `Successfully redeemed ${reward.title}! Use coupon code at checkout.`,
        couponCode: uniqueCode,
        discountValue: reward.discountValue,
        partnerName: reward.partnerName,
        remainingPoints: updatedWallet.pointsBalance,
        userReward,
        transaction,
      };
    });
  }

  async getUserRedeemedRewards(userId: string) {
    return this.prisma.userReward.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { redeemedAt: "desc" },
    });
  }

  async getTransactions(userId: string, type?: TransactionType) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async withdrawCash(userId: string, dto: WithdrawCashDto) {
    const wallet = await this.getWallet(userId);

    if (wallet.cashBalance < dto.amount) {
      throw new BadRequestException(
        `Insufficient cash balance. Available balance: $${wallet.cashBalance.toFixed(2)}, Requested: $${dto.amount.toFixed(2)}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { cashBalance: { decrement: dto.amount } },
      });

      const stripeTransferId = `tr_simulated_${Date.now()}`;

      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: -dto.amount,
          type: TransactionType.PAYOUT,
          status: TransactionStatus.COMPLETED,
          stripePaymentId: stripeTransferId,
          description: `Stripe Instant Payout withdrawal to bank account ($${dto.amount.toFixed(2)})`,
        },
      });

      this.logger.log(
        `💸 Collector ${userId} withdrew $${dto.amount} (Stripe Transfer: ${stripeTransferId})`,
      );

      return {
        success: true,
        message: `Successfully withdrew $${dto.amount.toFixed(2)} to your bank account via Stripe Instant Payout.`,
        stripeTransferId,
        remainingCashBalance: updatedWallet.cashBalance,
        transaction,
      };
    });
  }

  async getCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { discountPercent: "desc" },
    });
  }

  async validateCoupon(dto: ValidateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon code '${dto.code}' not found.`);
    }

    if (new Date() > coupon.validUntil) {
      throw new BadRequestException(`Coupon code '${dto.code}' has expired.`);
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException(
        `Coupon code '${dto.code}' has reached its usage limit.`,
      );
    }

    const discountAmount = Math.min(
      dto.orderAmount * (coupon.discountPercent / 100),
      coupon.maxDiscount,
    );
    const finalAmount = Math.max(0, dto.orderAmount - discountAmount);

    return {
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount: Number(discountAmount.toFixed(2)),
      finalAmount: Number(finalAmount.toFixed(2)),
    };
  }

  async subscribe(userId: string, dto: CreateSubscriptionDto) {
    const wallet = await this.getWallet(userId);
    const priceMonthly =
      dto.planName === SubscriptionPlanName.ECO_PRO ? 49.0 : 19.0;
    const pickupsPerMonth =
      dto.planName === SubscriptionPlanName.ECO_PRO ? 5 : 2;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.subscription.findFirst({
        where: { userId, status: "ACTIVE" },
      });

      let subscription;
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      if (existing) {
        subscription = await tx.subscription.update({
          where: { id: existing.id },
          data: {
            planName: dto.planName,
            priceMonthly,
            pickupsPerMonth,
            currentPeriodEnd: periodEnd,
          },
        });
      } else {
        subscription = await tx.subscription.create({
          data: {
            userId,
            planName: dto.planName,
            priceMonthly,
            pickupsPerMonth,
            status: "ACTIVE",
            stripeSubId: `sub_sim_${Date.now()}`,
            currentPeriodEnd: periodEnd,
          },
        });
      }

      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: -priceMonthly,
          type: TransactionType.SUBSCRIPTION,
          status: TransactionStatus.COMPLETED,
          stripePaymentId: `ch_sub_${Date.now()}`,
          description: `Subscription enrollment: ${dto.planName} ($${priceMonthly}/mo)`,
        },
      });

      this.logger.log(`👑 User ${userId} subscribed to ${dto.planName}`);

      return {
        success: true,
        message: `Successfully enrolled in ${dto.planName}!`,
        subscription,
        transaction,
      };
    });
  }

  async getCurrentSubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });
  }

  async cancelSubscription(userId: string, dto?: CancelSubscriptionDto) {
    const existing = await this.prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    if (!existing) {
      throw new NotFoundException("No active subscription found to cancel.");
    }

    const updated = await this.prisma.subscription.update({
      where: { id: existing.id },
      data: { status: "CANCELLED" },
    });

    this.logger.log(
      `🚫 User ${userId} cancelled subscription ${existing.planName} (Reason: ${dto?.reason || "None"})`,
    );

    return {
      success: true,
      message: `Subscription ${existing.planName} cancelled successfully.`,
      subscription: updated,
    };
  }

  async processCheckout(userId: string, dto: ProcessCheckoutDto) {
    const wallet = await this.getWallet(userId);
    let finalAmount = dto.amount;

    if (dto.couponCode) {
      const couponVal = await this.validateCoupon({
        code: dto.couponCode,
        orderAmount: dto.amount,
      });
      finalAmount = couponVal.finalAmount;

      await this.prisma.coupon.update({
        where: { code: dto.couponCode.toUpperCase() },
        data: { usedCount: { increment: 1 } },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          pickupRequestId: dto.pickupRequestId,
          amount: -finalAmount,
          type: TransactionType.PAYMENT,
          status: TransactionStatus.COMPLETED,
          stripePaymentId: `ch_sim_${Date.now()}`,
          description: `Payment checkout for ${dto.pickupRequestId ? "Pickup Order" : "Service Top-up"} ($${finalAmount.toFixed(2)})`,
        },
      });

      if (dto.pickupRequestId) {
        await tx.pickupRequest.update({
          where: { id: dto.pickupRequestId },
          data: { estimatedPayout: finalAmount },
        });
      }

      this.logger.log(
        `💳 User ${userId} completed checkout of $${finalAmount}`,
      );

      return {
        success: true,
        transactionId: transaction.id,
        finalAmount,
        stripePaymentId: transaction.stripePaymentId,
        message: "Payment processed successfully via Stripe Checkout.",
      };
    });
  }

  async processRefund(userId: string, dto: ProcessRefundDto) {
    const wallet = await this.getWallet(userId);
    const originalTx = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
    });

    if (!originalTx) {
      throw new NotFoundException(
        `Transaction '${dto.transactionId}' not found.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { cashBalance: { increment: dto.amount } },
      });

      const refundTx = await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: dto.amount,
          type: TransactionType.REFUND,
          status: TransactionStatus.COMPLETED,
          description: `Refund for Tx ${dto.transactionId}: ${dto.reason}`,
        },
      });

      this.logger.log(
        `🔄 Refunded $${dto.amount} to User ${userId} for Tx ${dto.transactionId}`,
      );

      return {
        success: true,
        refundTransactionId: refundTx.id,
        refundedAmount: dto.amount,
        newCashBalance: updatedWallet.cashBalance,
        message: "Refund processed and credited to wallet balance.",
      };
    });
  }

  async claimReferralBonus(userId: string, dto: ClaimReferralDto) {
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode: dto.referralCode },
    });

    if (!referrer) {
      throw new NotFoundException(
        `Referral code '${dto.referralCode}' is invalid.`,
      );
    }

    if (referrer.id === userId) {
      throw new BadRequestException("You cannot claim your own referral code.");
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.referredBy) {
      throw new BadRequestException(
        "You have already claimed a referral code.",
      );
    }

    const refereeWallet = await this.getWallet(userId);
    const referrerWallet = await this.getWallet(referrer.id);

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { referredBy: referrer.id, ecoScore: { increment: 50 } },
      });

      await tx.user.update({
        where: { id: referrer.id },
        data: { ecoScore: { increment: 50 } },
      });

      const updatedRefereeWallet = await tx.wallet.update({
        where: { userId },
        data: {
          pointsBalance: { increment: 200 },
          cashBalance: { increment: 5.0 },
          totalPointsEarned: { increment: 200 },
          totalCashEarned: { increment: 5.0 },
        },
      });

      await tx.wallet.update({
        where: { userId: referrer.id },
        data: {
          pointsBalance: { increment: 200 },
          cashBalance: { increment: 5.0 },
          totalPointsEarned: { increment: 200 },
          totalCashEarned: { increment: 5.0 },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          walletId: refereeWallet.id,
          amount: 5.0,
          pointsAmount: 200,
          type: TransactionType.BONUS,
          status: TransactionStatus.COMPLETED,
          description: `Referral bonus from code ${dto.referralCode} (+200 pts, +$5.00 cash)`,
        },
      });

      await tx.transaction.create({
        data: {
          userId: referrer.id,
          walletId: referrerWallet.id,
          amount: 5.0,
          pointsAmount: 200,
          type: TransactionType.BONUS,
          status: TransactionStatus.COMPLETED,
          description: `Referral reward for inviting user ${user?.fullName || "Friend"} (+200 pts, +$5.00 cash)`,
        },
      });

      this.logger.log(
        `🤝 Referral claimed: User ${userId} invited by ${referrer.id}`,
      );

      return {
        success: true,
        message:
          "Referral bonus claimed! Both you and your friend earned 200 Green Points and $5.00 cash.",
        newPointsBalance: updatedRefereeWallet.pointsBalance,
        newCashBalance: updatedRefereeWallet.cashBalance,
      };
    });
  }

  async creditEarnings(
    userId: string,
    amount: number,
    pointsAmount: number = 0,
    description: string = "Job completion earnings",
  ) {
    const wallet = await this.getWallet(userId);
    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          cashBalance: { increment: amount },
          pointsBalance: { increment: pointsAmount },
          totalCashEarned: { increment: amount },
          totalPointsEarned: { increment: pointsAmount },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount,
          pointsAmount,
          type: TransactionType.BONUS,
          status: TransactionStatus.COMPLETED,
          description,
        },
      });

      this.logger.log(
        `💰 Credited $${amount} and ${pointsAmount} pts to User ${userId}`,
      );
      return { wallet: updatedWallet, transaction };
    });
  }
}
