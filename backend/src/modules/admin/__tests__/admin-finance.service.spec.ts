import { Test, TestingModule } from "@nestjs/testing";
import { AdminFinanceService } from "../services/admin-finance.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { TransactionType, TransactionStatus } from "@prisma/client";

describe("AdminFinanceService (TDD Suite)", () => {
  let service: AdminFinanceService;
  let prisma: PrismaService;

  const mockTransactions = [
    {
      id: "tx-1",
      type: TransactionType.PAYMENT,
      status: TransactionStatus.COMPLETED,
      amount: 50.0, // Stripe payment from user
      pointsAmount: 500, // 500 points = $5.00 liability
      createdAt: new Date(),
    },
    {
      id: "tx-2",
      type: TransactionType.PAYOUT,
      status: TransactionStatus.COMPLETED,
      amount: 35.0, // Payout to collector
      pointsAmount: 0,
      createdAt: new Date(),
    },
  ];

  const mockMaterialBatches = [
    {
      id: "bat-1",
      weightKg: 1000,
      purityPercent: 99.0,
      status: "SOLD",
      category: { pricePerKg: 0.5 }, // 1000 * $0.50 = $500.00 recycler revenue
    },
  ];

  const mockPrismaService = {
    transaction: {
      findMany: jest.fn(),
    },
    materialBatch: {
      findMany: jest.fn(),
    },
    wallet: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminFinanceService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminFinanceService>(AdminFinanceService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it("1. should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("calculatePnL", () => {
    it("2. should aggregate Stripe payments, collector payouts, points liabilities, and recycler revenues to calculate net margin", async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue(
        mockTransactions,
      );
      mockPrismaService.materialBatch.findMany.mockResolvedValue(
        mockMaterialBatches,
      );

      const startDate = new Date("2026-01-01");
      const endDate = new Date("2026-12-31");

      const pnl = await service.calculatePnL(startDate, endDate);

      expect(prisma.transaction.findMany).toHaveBeenCalled();
      expect(prisma.materialBatch.findMany).toHaveBeenCalled();
      expect(pnl.stripePaymentsUsd).toBe(50.0);
      expect(pnl.collectorPayoutsUsd).toBe(35.0);
      expect(pnl.recyclerInvoicesUsd).toBe(500.0);
      expect(pnl.rewardsLiabilitiesUsd).toBe(5.0); // 500 points * $0.01 = $5.00
      // Net margin = 50 (Stripe) + 500 (Recycler) - 35 (Payout) - 5 (Liability) = 510.0
      expect(pnl.netMarginUsd).toBe(510.0);
    });

    it("3. should return zeroed snapshot when no transactions or sold batches exist in period", async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.materialBatch.findMany.mockResolvedValue([]);

      const pnl = await service.calculatePnL(new Date(), new Date());

      expect(pnl.grossRevenueUsd).toBe(0);
      expect(pnl.netMarginUsd).toBe(0);
      expect(pnl.totalTransactions).toBe(0);
    });
  });

  describe("reconcileLedgers", () => {
    it("4. should verify wallet balances match sum of completed transactions without discrepancies", async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([
        { id: "w-1", userId: "usr-1", cashBalance: 15.0, pointsBalance: 500 },
      ]);
      mockPrismaService.transaction.findMany.mockResolvedValue([
        {
          userId: "usr-1",
          type: TransactionType.PAYMENT,
          status: TransactionStatus.COMPLETED,
          amount: 50.0,
          pointsAmount: 500,
        },
        {
          userId: "usr-1",
          type: TransactionType.PAYOUT,
          status: TransactionStatus.COMPLETED,
          amount: 35.0,
          pointsAmount: 0,
        },
      ]); // 50 - 35 = 15.0 cash, 500 points

      const result = await service.reconcileLedgers();
      expect(result.success).toBe(true);
      expect(result.discrepanciesFound).toBe(0);
    });

    it("5. should flag discrepancies when wallet cash balance deviates from transactional net sum", async () => {
      mockPrismaService.wallet.findMany.mockResolvedValue([
        { id: "w-1", userId: "usr-1", cashBalance: 100.0, pointsBalance: 500 }, // Deviates from 15.0 net
      ]);
      mockPrismaService.transaction.findMany.mockResolvedValue([
        {
          userId: "usr-1",
          type: TransactionType.PAYMENT,
          status: TransactionStatus.COMPLETED,
          amount: 50.0,
          pointsAmount: 500,
        },
        {
          userId: "usr-1",
          type: TransactionType.PAYOUT,
          status: TransactionStatus.COMPLETED,
          amount: 35.0,
          pointsAmount: 0,
        },
      ]);

      const result = await service.reconcileLedgers();
      expect(result.success).toBe(false);
      expect(result.discrepanciesFound).toBe(1);
      expect(result.details[0]).toContain("deviates from transaction net");
    });
  });
});
