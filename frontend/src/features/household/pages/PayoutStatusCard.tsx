import React, { useState } from "react";
import { Card, Heading, Text, Button, Input, Badge } from "@/components/ui";
import { useWithdrawCash } from "../api/wallet.api";

interface PayoutStatusCardProps {
  availableBalance: number;
}

export const PayoutStatusCard: React.FC<PayoutStatusCardProps> = ({
  availableBalance,
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const withdrawMutation = useWithdrawCash();

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 10) return;
    withdrawMutation.mutate(
      { amount: amt },
      {
        onSuccess: () => {
          setWithdrawAmount("");
        },
      },
    );
  };

  return (
    <Card className="p-6 rounded-[30px] backdrop-blur-md bg-gradient-to-br from-zinc-900 to-black text-white border border-zinc-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-[rgb(215,255,67)]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="space-y-6 relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant="success" className="bg-[rgb(215,255,67)] text-black font-bold">
              Stripe Instant Payout
            </Badge>
            <Heading level={3} className="text-white mt-1">
              Collector Earnings
            </Heading>
            <Text variant="muted" className="text-zinc-400">
              Withdraw funds instantly to your connected bank account
            </Text>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block">
              Available Cash
            </span>
            <span className="text-3xl font-extrabold text-[rgb(215,255,67)]">
              ${availableBalance.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 space-y-3">
          <div className="flex items-center justify-between text-sm text-zinc-300">
            <span>Minimum withdrawal: $10.00</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Instant Transfer Ready
            </span>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                $
              </span>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                min="10"
                max={availableBalance.toString()}
                className="pl-8 bg-zinc-900 border-zinc-700 text-white rounded-xl font-bold"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleWithdraw}
              disabled={
                withdrawMutation.isPending ||
                !withdrawAmount ||
                parseFloat(withdrawAmount) < 10 ||
                parseFloat(withdrawAmount) > availableBalance
              }
              className="px-6 rounded-xl bg-[rgb(215,255,67)] hover:bg-[rgb(195,235,47)] text-black font-bold transition-all"
            >
              {withdrawMutation.isPending ? "Transferring..." : "Withdraw Now"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
