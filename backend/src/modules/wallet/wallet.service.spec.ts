import { Test, TestingModule } from "@nestjs/testing";
import { WalletService } from "./wallet.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { SubscriptionPlanName } from "./dto/wallet.dto";

describe("WalletService", () => {
  let service: WalletService;
  let prisma: PrismaService;

  const mockWallet = {
    id: "wallet-1",
    userId: "user-1",
    pointsBalance: 500,
    cashBalance: 100.0,
    totalPointsEarned: 500,
    totalCashEarned: 100.0,
  };

  const mockReward = {
    id: "reward-1",
    title: "$10 Whole Foods Voucher",
    pointsCost: 300,
    discountValue: "$10 OFF",
    partnerName: "Whole Foods",
    couponCode: "WF10OFF",
    isActive: true,
    redeemedCount: 5,
  };

  const mockCoupon = {
    id: "coupon-1",
    code: "ECO-SUMMER-20",
    discountPercent: 20,
    maxDiscount: 15,
    validUntil: new Date("2030-01-01"),
    usageLimit: 100,
    usedCount: 10,
  };

  const mockSubscription = {
    id: "sub-1",
    userId: "user-1",
    planName: SubscriptionPlanName.ECO_PRO,
    priceMonthly: 49.0,
    pickupsPerMonth: 5,
    status: "ACTIVE",
    stripeSubId: "sub_sim_123",
    currentPeriodEnd: new Date("2030-01-01"),
  };

  const mockPrismaService = {
    wallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    reward: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userReward: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    coupon: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    pickupRequest: {
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getWallet", () => {
    it("should return existing wallet if found", async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      const result = await service.getWallet("user-1");
      expect(result).toEqual(mockWallet);
    });

    it("should create and return a new wallet if not found", async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(null);
      mockPrismaService.wallet.create.mockResolvedValue(mockWallet);
      const result = await service.getWallet("user-1");
      expect(result).toEqual(mockWallet);
    });
  });

  describe("getWalletDashboard", () => {
    it("should return complete dashboard summary", async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockSubscription,
      );
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.userReward.findMany.mockResolvedValue([]);
      mockPrismaService.user.findUnique.mockResolvedValue({
        ecoScore: 120,
        carbonSavedKg: 15.5,
        referralCode: "REF-123",
      });

      const result = await service.getWalletDashboard("user-1");
      expect(result.wallet).toEqual(mockWallet);
      expect(result.activeSubscription).toEqual(mockSubscription);
      expect(result.stats.ecoScore).toBe(120);
    });
  });

  describe("redeemReward", () => {
    it("should redeem reward successfully when balance is sufficient", async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.reward.findUnique.mockResolvedValue(mockReward);
      mockPrismaService.wallet.update.mockResolvedValue({
        ...mockWallet,
        pointsBalance: 200,
      });
      mockPrismaService.reward.update.mockResolvedValue({
        ...mockReward,
        redeemedCount: 6,
      });
      mockPrismaService.userReward.create.mockResolvedValue({
        id: "ur-1",
        redeemedCode: "WHO-1234-ECO",
      });
      mockPrismaService.transaction.create.mockResolvedValue({
        id: "tx-1",
      });

      const result = await service.redeemReward("user-1", {
        rewardId: "reward-1",
      });

      expect(result.success).toBe(true);
      expect(result.remainingPoints).toBe(200);
      expect(result.couponCode).toContain("WHO-");
    });

    it("should throw BadRequestException if points balance is insufficient", async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue({
        ...mockWallet,
        pointsBalance: 100,
      });
      mockPrismaService.reward.findUnique.mockResolvedValue(mockReward);

      await expect(
        service.redeemReward("user-1", { rewardId: "reward-1" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should return existing transaction without deducting points when idempotencyKey replay is detected", async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValueOnce({
        id: "tx-replay-1",
        idempotencyKey: "idem_reward_1",
      });
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.redeemReward("user-1", {
        rewardId: "reward-1",
        idempotencyKey: "idem_reward_1",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("idempotency replay");
      expect(mockPrismaService.wallet.update).not.toHaveBeenCalled();
    });
  });

  describe("withdrawCash", () => {
    it("should withdraw cash successfully when balance and limits are respected", async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.wallet.update.mockResolvedValue({
        ...mockWallet,
        cashBalance: 50.0,
      });
      mockPrismaService.transaction.create.mockResolvedValue({
        id: "tx-withdraw-1",
      });

      const result = await service.withdrawCash("user-1", { amount: 50.0 });
      expect(result.success).toBe(true);
      expect(result.remainingCashBalance).toBe(50.0);
    });

    it("should return existing transaction without decrementing balance when idempotencyKey replay is detected", async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValueOnce({
        id: "tx-withdraw-replay",
        idempotencyKey: "idem_withdraw_1",
        stripePaymentId: "tr_sim_123",
      });
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.withdrawCash("user-1", {
        amount: 50.0,
        idempotencyKey: "idem_withdraw_1",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("idempotency replay");
      expect(mockPrismaService.wallet.update).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when daily withdrawal velocity limit (5/day) is exceeded", async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);
      mockPrismaService.transaction.findMany.mockResolvedValue([
        { id: "1", amount: -10 },
        { id: "2", amount: -10 },
        { id: "3", amount: -10 },
        { id: "4", amount: -10 },
        { id: "5", amount: -10 },
      ]);

      await expect(
        service.withdrawCash("user-1", { amount: 20.0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when daily withdrawal cash limit ($1000/day) is exceeded", async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);
      mockPrismaService.transaction.findMany.mockResolvedValue([
        { id: "1", amount: -950 },
      ]);

      await expect(
        service.withdrawCash("user-1", { amount: 100.0 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("validateCoupon", () => {
    it("should validate promo code and calculate discount correctly", async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(mockCoupon);
      const result = await service.validateCoupon({
        code: "ECO-SUMMER-20",
        orderAmount: 50.0,
      });

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(10.0);
      expect(result.finalAmount).toBe(40.0);
    });

    it("should throw NotFoundException if coupon code does not exist", async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(null);
      await expect(
        service.validateCoupon({ code: "INVALID", orderAmount: 50.0 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("subscribe", () => {
    it("should enroll user in subscription plan", async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);
      mockPrismaService.subscription.create.mockResolvedValue(mockSubscription);
      mockPrismaService.transaction.create.mockResolvedValue({ id: "tx-sub" });

      const result = await service.subscribe("user-1", {
        planName: SubscriptionPlanName.ECO_PRO,
      });

      expect(result.success).toBe(true);
      expect(result.subscription).toEqual(mockSubscription);
    });
  });

  describe("processCheckout", () => {
    it("should process checkout payment successfully", async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.transaction.create.mockResolvedValue({
        id: "tx-check",
        stripePaymentId: "ch_sim_123",
      });

      const result = await service.processCheckout("user-1", {
        amount: 25.0,
      });

      expect(result.success).toBe(true);
      expect(result.finalAmount).toBe(25.0);
    });
  });

  describe("claimReferralBonus", () => {
    it("should award 200 pts and $5.00 cash to referrer and referee", async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce({ id: "referrer-1", referralCode: "REF-999" })
        .mockResolvedValueOnce({ id: "user-1", referredBy: null });
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.wallet.update.mockResolvedValue({
        ...mockWallet,
        pointsBalance: 700,
        cashBalance: 105.0,
      });
      mockPrismaService.transaction.create.mockResolvedValue({});

      const result = await service.claimReferralBonus("user-1", {
        referralCode: "REF-999",
      });

      expect(result.success).toBe(true);
      expect(result.newPointsBalance).toBe(700);
      expect(result.newCashBalance).toBe(105.0);
    });
  });
});
