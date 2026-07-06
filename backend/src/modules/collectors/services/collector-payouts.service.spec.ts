import { Test, TestingModule } from "@nestjs/testing";
import { CollectorPayoutsService } from "./collector-payouts.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { WalletService } from "../../wallet/wallet.service";
import { StripeConnectProvider } from "../providers/stripe-connect.provider";
import { NotFoundException, BadRequestException } from "@nestjs/common";

describe("CollectorPayoutsService", () => {
  let service: CollectorPayoutsService;

  const mockCollector = {
    id: "collector-1",
    userId: "user-col-1",
    totalEarnings: 1250.0,
    instantPayoutsEnabled: true,
    bankAccountLast4: "4242",
    stripeConnectId: "acct_1032D8299381",
  };

  const mockWallet = {
    id: "wallet-1",
    userId: "user-col-1",
    cashBalance: 150.0,
  };

  const mockPrismaService = {
    collector: {
      findUnique: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockWalletService = {
    getWallet: jest.fn().mockResolvedValue(mockWallet),
    withdrawCash: jest.fn().mockResolvedValue({
      success: true,
      remainingCashBalance: 100.0,
      transaction: { id: "tx-payout-1" },
    }),
  };

  const mockStripeConnectProvider = {
    createInstantTransfer: jest.fn().mockResolvedValue({
      transferId: "tr_connect_123",
      status: "COMPLETED",
      amountCents: 5000,
      currency: "usd",
      destinationAccount: "acct_1032D8299381",
      created: new Date(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectorPayoutsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: WalletService, useValue: mockWalletService },
        { provide: StripeConnectProvider, useValue: mockStripeConnectProvider },
      ],
    }).compile();

    service = module.get<CollectorPayoutsService>(CollectorPayoutsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getEarningsSummary", () => {
    it("should return earnings summary and instant payout eligibility", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      const result = await service.getEarningsSummary("user-col-1");
      expect(result.totalEarnings).toBe(1250.0);
      expect(result.currentCashBalance).toBe(150.0);
      expect(result.instantPayoutsEnabled).toBe(true);
    });
  });

  describe("requestInstantPayout", () => {
    it("should process instant transfer via Stripe Connect, deduct balance, and log audit", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockWalletService.getWallet.mockResolvedValue(mockWallet);

      const result = await service.requestInstantPayout("user-col-1", {
        amount: 50.0,
      });
      expect(result.success).toBe(true);
      expect(result.transferId).toBe("tr_connect_123");
      expect(
        mockStripeConnectProvider.createInstantTransfer,
      ).toHaveBeenCalledWith("collector-1", 5000, "usd", "acct_1032D8299381");
      expect(mockWalletService.withdrawCash).toHaveBeenCalledWith(
        "user-col-1",
        { amount: 50.0 },
      );
      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });

    it("should throw BadRequestException if instant payouts are disabled", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue({
        ...mockCollector,
        instantPayoutsEnabled: false,
      });

      await expect(
        service.requestInstantPayout("user-col-1", { amount: 50.0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if requested amount exceeds cash balance", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(mockCollector);
      mockWalletService.getWallet.mockResolvedValue({
        ...mockWallet,
        cashBalance: 20.0,
      });

      await expect(
        service.requestInstantPayout("user-col-1", { amount: 50.0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if collector profile is not found in getEarningsSummary", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(null);
      await expect(service.getEarningsSummary("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException if collector profile is not found in requestInstantPayout", async () => {
      mockPrismaService.collector.findUnique.mockResolvedValue(null);
      await expect(
        service.requestInstantPayout("unknown", { amount: 50.0 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
