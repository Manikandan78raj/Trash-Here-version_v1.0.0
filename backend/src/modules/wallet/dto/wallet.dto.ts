import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsPositive,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum SubscriptionPlanName {
  ECO_STARTER = "Eco Starter",
  ECO_PRO = "Eco Pro",
}

export class RedeemRewardDto {
  @ApiProperty({
    example: "uuid-of-reward",
    description: "Reward ID to redeem",
  })
  @IsString()
  @IsNotEmpty()
  rewardId: string;

  @ApiPropertyOptional({
    example: "idem_reward_12345",
    description:
      "Unique idempotency key to prevent duplicate reward redemption",
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

export class WithdrawCashDto {
  @ApiProperty({
    example: 150.0,
    description: "Amount in USD to withdraw to bank/Stripe account",
  })
  @IsNumber()
  @Min(10)
  amount: number;

  @ApiPropertyOptional({
    example: "idem_withdraw_12345",
    description:
      "Unique idempotency key to prevent duplicate withdrawal processing",
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

export class CreateSubscriptionDto {
  @ApiProperty({
    example: SubscriptionPlanName.ECO_PRO,
    enum: SubscriptionPlanName,
    description: "Subscription plan name to enroll in",
  })
  @IsEnum(SubscriptionPlanName)
  @IsNotEmpty()
  planName: SubscriptionPlanName;

  @ApiPropertyOptional({
    example: "pm_card_visa",
    description: "Stripe payment method token/ID",
  })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({
    example: "Moving out of service area",
    description: "Reason for cancellation",
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ProcessCheckoutDto {
  @ApiProperty({
    example: 25.0,
    description: "Total checkout amount in USD before coupon discount",
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    example: "USD",
    default: "USD",
    description: "Currency code",
  })
  @IsOptional()
  @IsString()
  currency?: string = "USD";

  @ApiPropertyOptional({
    example: "uuid-of-pickup-request",
    description: "Associated pickup request ID if paying for on-demand pickup",
  })
  @IsOptional()
  @IsString()
  pickupRequestId?: string;

  @ApiPropertyOptional({
    example: "ECO-SUMMER-20",
    description: "Optional discount coupon code",
  })
  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class ProcessRefundDto {
  @ApiProperty({
    example: "uuid-of-transaction",
    description: "Transaction ID to refund",
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    example: 25.0,
    description: "Amount in USD to refund",
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: "Accidental double booking",
    description: "Reason for refund",
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ClaimReferralDto {
  @ApiProperty({
    example: "ECO-REF-88419",
    description: "Referral code from another user",
  })
  @IsString()
  @IsNotEmpty()
  referralCode: string;
}

export class ValidateCouponDto {
  @ApiProperty({
    example: "ECO-SUMMER-20",
    description: "Coupon code to validate",
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 40.0,
    description: "Order total amount before discount",
  })
  @IsNumber()
  @IsPositive()
  orderAmount: number;
}
