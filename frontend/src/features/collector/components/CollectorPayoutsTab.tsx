import React, { useState } from 'react';
import { DollarSign, Building2, Zap, History, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCollectorPayoutsSummary, useRequestInstantPayout } from '../api/collector.api';

export const CollectorPayoutsTab: React.FC = () => {
  const { data: summary, isLoading, refetch } = useCollectorPayoutsSummary();
  const requestPayoutMutation = useRequestInstantPayout();
  const [amount, setAmount] = useState<string>('50.00');

  const cashBalance = summary?.currentCashBalance || 0;
  const isEligible = summary?.instantPayoutsEnabled ?? true;

  const handleInstantPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    requestPayoutMutation.mutate({ amount: parsedAmount });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton variant="rectangular" height="150px" />
          <Skeleton variant="rectangular" height="150px" />
          <Skeleton variant="rectangular" height="150px" />
        </div>
        <Skeleton variant="rectangular" height="300px" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stripe Connect Banner */}
      <Card className="p-6 bg-gradient-to-r from-card via-card to-primary/10 border-border/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary text-primary-foreground font-black text-2xl shadow-md glow-primary">
            <Zap className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Stripe Connect Instant Payouts
              </h2>
              <Badge variant={isEligible ? 'success' : 'warning'}>
                {isEligible ? '⚡ INSTANT TRANSFER READY' : '⏳ PENDING VERIFICATION'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Account ID:{' '}
              <span className="font-mono font-semibold text-foreground">
                {summary?.stripeConnectId || 'acct_1032D8299381'}
              </span>{' '}
              • Connected Debit Card ending in{' '}
              <span className="font-mono font-bold text-foreground">
                •••• {summary?.bankAccountLast4 || '4242'}
              </span>
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh Balance
        </Button>
      </Card>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3 border-border/60 bg-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Current Cash Balance</span>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div className="text-4xl font-heading font-black text-foreground">
            ${cashBalance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Available for immediate withdrawal</p>
        </Card>

        <Card className="p-6 space-y-3 border-border/60 bg-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Lifetime Earnings
            </span>
            <ShieldCheck className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-4xl font-heading font-black text-foreground">
            ${(summary?.totalEarnings || 1250.0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Verified GPS geofence deliveries</p>
        </Card>

        <Card className="p-6 space-y-3 border-border/60 bg-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Connected Account</span>
            <Building2 className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-lg font-heading font-bold text-foreground truncate">
            Stripe Debit Card •••• {summary?.bankAccountLast4 || '4242'}
          </div>
          <p className="text-xs text-muted-foreground">Automatic 30-minute transfer speed</p>
        </Card>
      </div>

      {/* Instant Cash Out Action Widget */}
      <Card className="p-6 border-primary/50 bg-primary/5 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Request Instant Withdrawal
            </h3>
            <p className="text-xs text-muted-foreground">
              Withdraw funds directly to your verified debit card. Minimum withdrawal amount is
              $10.00.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              Available Balance
            </span>
            <p className="text-lg font-bold text-primary">${cashBalance.toFixed(2)}</p>
          </div>
        </div>

        <form
          onSubmit={handleInstantPayout}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <div className="relative flex-1 w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              min="10.00"
              max={cashBalance || 500}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter withdrawal amount..."
              className="pl-8 text-lg font-bold h-12"
              required
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setAmount(cashBalance.toFixed(2))}
            className="w-full sm:w-auto h-12 font-bold text-xs"
          >
            Max (${cashBalance.toFixed(2)})
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              !isEligible ||
              requestPayoutMutation.isPending ||
              parseFloat(amount) > cashBalance ||
              parseFloat(amount) < 10
            }
            className="w-full sm:w-auto h-12 px-8 glow-primary font-bold"
          >
            {requestPayoutMutation.isPending ? 'Transferring...' : '⚡ Cash Out Now'}
          </Button>
        </form>
      </Card>

      {/* Transfer History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" /> Recent Payout History
          </h3>
          <span className="text-xs font-semibold text-muted-foreground">Stripe Connect Ledger</span>
        </div>

        {!summary?.recentPayouts || summary.recentPayouts.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground bg-card/60">
            <p className="text-sm font-semibold">No recent payout transfers recorded.</p>
            <p className="text-xs mt-1">
              Request an instant cash withdrawal above to see your transfer history.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden border-border/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                  <tr>
                    <th className="p-4">Transfer Reference</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {summary.recentPayouts.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-mono text-xs text-foreground font-bold">
                        {tx.referenceId || `tr_connect_${tx.id.slice(0, 8)}`}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-foreground font-mono">
                        ${Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        Stripe Account ({summary.stripeConnectId || 'acct_1032'})
                      </td>
                      <td className="p-4 text-right">
                        <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'warning'}>
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
