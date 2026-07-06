import { Controller, Get, Post, Body, UseGuards, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { WalletService } from "./wallet.service";
import {
  RedeemRewardDto,
  WithdrawCashDto,
  CreateSubscriptionDto,
  CancelSubscriptionDto,
  ProcessCheckoutDto,
  ProcessRefundDto,
  ClaimReferralDto,
  ValidateCouponDto,
} from "./dto/wallet.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RoleType, TransactionType } from "@prisma/client";

@ApiTags("Wallet & Rewards Store")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get current user points balance, cash balance, and lifetime earnings",
  })
  async getWallet(@CurrentUser() user: any) {
    return this.walletService.getWallet(user.id);
  }

  @Get("dashboard")
  @ApiOperation({
    summary:
      "Get complete wallet dashboard including active subscription, vouchers, and recent ledger activity",
  })
  async getWalletDashboard(@CurrentUser() user: any) {
    return this.walletService.getWalletDashboard(user.id);
  }

  @Get("rewards")
  @ApiOperation({
    summary: "Get catalog of partner rewards and discount vouchers",
  })
  async getRewards() {
    return this.walletService.getRewards();
  }

  @Post("rewards/redeem")
  @ApiOperation({
    summary: "Redeem Green Points for partner discount coupon code",
  })
  @ApiResponse({
    status: 200,
    description: "Points deducted and coupon code returned",
  })
  async redeemReward(@CurrentUser() user: any, @Body() dto: RedeemRewardDto) {
    return this.walletService.redeemReward(user.id, dto);
  }

  @Get("rewards/my-vouchers")
  @ApiOperation({
    summary: "Get list of active and used partner vouchers redeemed by user",
  })
  async getUserRedeemedRewards(@CurrentUser() user: any) {
    return this.walletService.getUserRedeemedRewards(user.id);
  }

  @Get("transactions")
  @ApiOperation({ summary: "Get wallet transaction and reward history" })
  @ApiQuery({ name: "type", enum: TransactionType, required: false })
  async getTransactions(
    @CurrentUser() user: any,
    @Query("type") type?: TransactionType,
  ) {
    return this.walletService.getTransactions(user.id, type);
  }

  @Post("withdraw")
  @UseGuards(RolesGuard)
  @Roles(RoleType.COLLECTOR, RoleType.ADMIN)
  @ApiOperation({
    summary:
      "Withdraw cash balance to bank account via Stripe Instant Payout (Collector only)",
  })
  @ApiResponse({
    status: 200,
    description: "Cash withdrawn and Stripe transfer ID returned",
  })
  async withdrawCash(@CurrentUser() user: any, @Body() dto: WithdrawCashDto) {
    return this.walletService.withdrawCash(user.id, dto);
  }

  @Get("coupons")
  @ApiOperation({ summary: "Get active promotional discount coupons" })
  async getCoupons() {
    return this.walletService.getCoupons();
  }

  @Post("coupons/validate")
  @ApiOperation({ summary: "Validate discount promo code against order total" })
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.walletService.validateCoupon(dto);
  }

  @Post("subscriptions")
  @ApiOperation({ summary: "Enroll in or switch subscription plan (Eco Starter / Eco Pro)" })
  async subscribe(@CurrentUser() user: any, @Body() dto: CreateSubscriptionDto) {
    return this.walletService.subscribe(user.id, dto);
  }

  @Get("subscriptions/current")
  @ApiOperation({ summary: "Get user current active subscription plan" })
  async getCurrentSubscription(@CurrentUser() user: any) {
    return this.walletService.getCurrentSubscription(user.id);
  }

  @Post("subscriptions/cancel")
  @ApiOperation({ summary: "Cancel active subscription at period end" })
  async cancelSubscription(
    @CurrentUser() user: any,
    @Body() dto?: CancelSubscriptionDto,
  ) {
    return this.walletService.cancelSubscription(user.id, dto);
  }

  @Post("checkout")
  @ApiOperation({ summary: "Process payment checkout via Stripe Simulation" })
  async processCheckout(@CurrentUser() user: any, @Body() dto: ProcessCheckoutDto) {
    return this.walletService.processCheckout(user.id, dto);
  }

  @Post("refund")
  @ApiOperation({ summary: "Process transaction refund and credit wallet balance" })
  async processRefund(@CurrentUser() user: any, @Body() dto: ProcessRefundDto) {
    return this.walletService.processRefund(user.id, dto);
  }

  @Post("referral/claim")
  @ApiOperation({ summary: "Claim referral code bonus (+200 pts, +$5.00 cash)" })
  async claimReferralBonus(@CurrentUser() user: any, @Body() dto: ClaimReferralDto) {
    return this.walletService.claimReferralBonus(user.id, dto);
  }
}
