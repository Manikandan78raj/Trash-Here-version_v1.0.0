import React, { useState } from "react";
import {
  Card,
  Heading,
  Text,
  Button,
  Badge,
  Skeleton,
  EmptyState,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  Input,
  Dialog,
} from "@/components/ui";
import { useWalletDashboard, useClaimReferral } from "../api/wallet.api";
import { PaymentCheckoutModal } from "./PaymentCheckoutModal";
import { PayoutStatusCard } from "./PayoutStatusCard";
import { toast } from "@/common/notifications/toast";

export const WalletDashboardPage: React.FC = () => {
  const { data: dashboard, isLoading } = useWalletDashboard();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState("");

  const claimReferralMutation = useClaimReferral();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" height="220px" className="rounded-[30px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton variant="rectangular" height="150px" className="rounded-[30px]" />
          <Skeleton variant="rectangular" height="150px" className="rounded-[30px]" />
          <Skeleton variant="rectangular" height="150px" className="rounded-[30px]" />
        </div>
        <Skeleton variant="rectangular" height="300px" className="rounded-[30px]" />
      </div>
    );
  }

  const wallet = dashboard?.wallet || {
    pointsBalance: 0,
    cashBalance: 0.0,
    totalPointsEarned: 0,
    totalCashEarned: 0.0,
  };

  const stats = dashboard?.stats || {
    ecoScore: 100,
    carbonSavedKg: 0.0,
    referralCode: "ECO-USER",
  };

  const transactions = dashboard?.recentTransactions || [];

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(stats.referralCode);
    toast.success(`Copied your referral code "${stats.referralCode}" to clipboard!`);
  };

  const handleClaimReferral = () => {
    if (!referralCodeInput.trim()) return;
    claimReferralMutation.mutate(
      { referralCode: referralCodeInput.trim() },
      {
        onSuccess: () => {
          setIsReferralOpen(false);
          setReferralCodeInput("");
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Wallet Card */}
      <Card className="p-8 rounded-[30px] bg-gradient-to-r from-black via-zinc-900 to-zinc-900 text-white border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[rgb(215,255,67)]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3">
            <Badge variant="success" className="bg-[rgb(215,255,67)] text-black font-extrabold px-3 py-1">
              Trash Here Wallet
            </Badge>
            <span className="text-xs text-zinc-400 font-medium">
              Verified Green Ledger
            </span>
          </div>

          <div className="flex items-baseline gap-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                Green Points
              </span>
              <span className="text-4xl md:text-5xl font-black text-[rgb(215,255,67)] tracking-tight">
                {wallet.pointsBalance.toLocaleString()}{" "}
                <span className="text-sm font-normal text-white">pts</span>
              </span>
            </div>

            <div className="border-l border-zinc-800 pl-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                Cash Balance
              </span>
              <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                ${wallet.cashBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap md:flex-col gap-3 w-full md:w-auto relative z-10">
          <Button
            variant="primary"
            onClick={() => setIsCheckoutOpen(true)}
            className="flex-1 md:flex-none py-3 px-6 rounded-2xl bg-[rgb(215,255,67)] hover:bg-[rgb(195,235,47)] text-black font-bold text-sm shadow-lg shadow-[rgb(215,255,67)]/20 transition-all"
          >
            + Top-Up Wallet
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsReferralOpen(true)}
            className="flex-1 md:flex-none py-3 px-6 rounded-2xl border-zinc-700 hover:bg-zinc-800 text-white font-bold text-sm"
          >
            🤝 Refer & Earn ($5)
          </Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-[30px] border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md flex flex-col justify-between space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Eco Score Tier
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600 dark:text-[rgb(215,255,67)]">
              {stats.ecoScore}
            </span>
            <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              {stats.ecoScore >= 200 ? "Platinum Eco" : stats.ecoScore >= 100 ? "Gold Eco" : "Silver Eco"}
            </Badge>
          </div>
          <Text variant="muted" className="text-xs">
            Earn points with every verified waste pickup
          </Text>
        </Card>

        <Card className="p-6 rounded-[30px] border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md flex flex-col justify-between space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Carbon Offset Saved
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-black dark:text-white">
              {stats.carbonSavedKg.toFixed(1)}{" "}
              <span className="text-sm font-normal text-zinc-500">kg CO₂</span>
            </span>
            <span className="text-xs font-bold text-emerald-500">🌱 Verified</span>
          </div>
          <Text variant="muted" className="text-xs">
            Equivalent to planting ~{Math.max(1, Math.floor(stats.carbonSavedKg / 5))} trees
          </Text>
        </Card>

        <Card className="p-6 rounded-[30px] border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md flex flex-col justify-between space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Your Invite Code
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl font-bold text-black dark:text-white">
              {stats.referralCode}
            </span>
            <Button
              variant="secondary"
              onClick={handleCopyReferral}
              className="rounded-xl px-3 py-1 text-xs font-bold"
            >
              Copy
            </Button>
          </div>
          <Text variant="muted" className="text-xs">
            Give a friend 200 pts & $5 cash, get 200 pts & $5 cash!
          </Text>
        </Card>
      </div>

      {/* Collector Payout Section (if cash balance > 0 or collector) */}
      <PayoutStatusCard availableBalance={wallet.cashBalance} />

      {/* Transaction Ledger Table */}
      <Card className="p-8 rounded-[30px] border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 shadow-xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Heading level={3}>Ledger Activity</Heading>
            <Text variant="muted" className="text-sm">
              Real-time audit log of points earned, vouchers redeemed, and payment transactions
            </Text>
          </div>
        </div>

        {transactions.length === 0 ? (
          <EmptyState
            title="No ledger activity yet"
            description="Complete a waste pickup or redeem a voucher to see transactions here."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader className="text-right">Amount</TableHeader>
                  <TableHeader className="text-right">Points</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx: any) => {
                  const isPositiveCash = tx.amount > 0;
                  const isPositivePoints = (tx.pointsAmount || 0) > 0;
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs text-zinc-500">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.type === "BONUS" || tx.type === "PAYOUT"
                              ? "success"
                              : tx.type === "REWARD_REDEMPTION"
                              ? "warning"
                              : "secondary"
                          }
                          className="font-bold text-xs"
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm text-black dark:text-white">
                        {tx.description}
                      </TableCell>
                      <TableCell className={`text-right font-bold text-sm ${isPositiveCash ? "text-emerald-600 dark:text-emerald-400" : tx.amount < 0 ? "text-red-500" : "text-zinc-400"}`}>
                        {tx.amount === 0 ? "—" : `${isPositiveCash ? "+" : ""}$${Math.abs(tx.amount).toFixed(2)}`}
                      </TableCell>
                      <TableCell className={`text-right font-bold text-sm ${isPositivePoints ? "text-[rgb(215,255,67)]" : (tx.pointsAmount || 0) < 0 ? "text-amber-500" : "text-zinc-400"}`}>
                        {!tx.pointsAmount ? "—" : `${isPositivePoints ? "+" : ""}${tx.pointsAmount} pts`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Top-Up Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialAmount={25.0}
      />

      {/* Refer & Earn Modal */}
      <Dialog
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        title="Claim Referral Bonus"
        className="max-w-md rounded-[30px] p-6 bg-white dark:bg-zinc-900 border border-zinc-800 shadow-2xl"
      >
        <div className="space-y-4 pt-2">
          <Text variant="muted" className="text-sm">
            Enter a friend's invite code to claim your welcome bonus of 200 Green Points and $5.00 cash!
          </Text>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-zinc-500">
              Referral Code
            </label>
            <Input
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. ECO-USER-88419"
              className="rounded-xl uppercase font-mono"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleClaimReferral}
              disabled={!referralCodeInput.trim() || claimReferralMutation.isPending}
              className="flex-1 rounded-xl bg-[rgb(215,255,67)] hover:bg-[rgb(195,235,47)] text-black font-bold py-3"
            >
              {claimReferralMutation.isPending ? "Claiming..." : "Claim $5 & 200 pts"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsReferralOpen(false)}
              className="rounded-xl px-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
