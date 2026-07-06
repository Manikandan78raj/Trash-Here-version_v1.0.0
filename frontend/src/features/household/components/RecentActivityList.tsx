import { motion } from 'framer-motion';
import {
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card, Heading, Text, Button, Skeleton, Badge, EmptyState } from '@/components/ui';
import {
  useWalletTransactions,
  useMyPickups,
  type WalletTransaction,
  type PickupRequest,
} from '../api/household.api';

interface RecentActivityListProps {
  onViewAll?: () => void;
}

export const RecentActivityList = ({ onViewAll }: RecentActivityListProps) => {
  const {
    data: transactions,
    isLoading: isTxLoading,
    isError: isTxError,
    refetch: refetchTx,
  } = useWalletTransactions();

  const {
    data: pickups,
    isLoading: isPickupsLoading,
    isError: isPickupsError,
    refetch: refetchPickups,
  } = useMyPickups();

  const isLoading = isTxLoading || isPickupsLoading;
  const isError = isTxError || isPickupsError;

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4 border-border/50 bg-card/60">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="200px" height="1.5rem" />
          <Skeleton variant="rectangular" width="80px" height="32px" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/30"
            >
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width="40px" height="40px" />
                <div className="space-y-1">
                  <Skeleton variant="text" width="140px" height="1rem" />
                  <Skeleton variant="text" width="100px" height="0.8rem" />
                </div>
              </div>
              <Skeleton variant="text" width="60px" height="1.2rem" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 border-destructive/30 bg-destructive/5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Heading level={3} className="text-destructive">
              Unable to load activity log
            </Heading>
            <Text variant="small" className="text-muted-foreground mt-1">
              Failed to synchronize ledger transactions and completed pickup events.
            </Text>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => {
              void refetchTx();
              void refetchPickups();
            }}
          >
            Retry Ledger Sync
          </Button>
        </div>
      </Card>
    );
  }

  // Combine transactions and completed pickups into a unified activity feed
  const txItems = (transactions ?? []).map((tx: WalletTransaction) => ({
    id: `tx-${tx.id}`,
    title: tx.description || 'Wallet Transaction',
    subtitle: `${tx.type} • ${new Date(tx.createdAt).toLocaleDateString()}`,
    amount:
      tx.amount > 0
        ? `+$${tx.amount.toFixed(2)}`
        : tx.amount < 0
          ? `-$${Math.abs(tx.amount).toFixed(2)}`
          : null,
    points: tx.points > 0 ? `+${tx.points} pts` : tx.points < 0 ? `${tx.points} pts` : null,
    type: tx.type,
    timestamp: new Date(tx.createdAt).getTime(),
    icon:
      tx.type === 'EARNED' ? (
        <ArrowDownLeft className="h-5 w-5 text-emerald-400" />
      ) : tx.type === 'REDEEMED' ? (
        <Gift className="h-5 w-5 text-purple-400" />
      ) : (
        <ArrowUpRight className="h-5 w-5 text-amber-400" />
      ),
  }));

  const pickupItems = (pickups ?? [])
    .filter((p: PickupRequest) => p.status === 'COMPLETED')
    .map((p: PickupRequest) => ({
      id: `pickup-${p.id}`,
      title: `Pickup Completed (${p.actualWeightKg ?? p.estimatedWeightKg} kg)`,
      subtitle: `AI Verified • ${new Date(p.scheduledDate).toLocaleDateString()}`,
      amount: null,
      points: '+150 pts',
      type: 'PICKUP_COMPLETED',
      timestamp: new Date(p.updatedAt || p.createdAt).getTime(),
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
    }));

  const combinedFeed = [...txItems, ...pickupItems]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  return (
    <Card className="p-6 md:p-8 border-border/60 bg-card/80 backdrop-blur-xl shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={2} className="text-xl md:text-2xl font-bold tracking-tight">
            Recent Activity
          </Heading>
          <Text variant="small" className="text-muted-foreground">
            Unified ledger of your waste pickups, reward redemptions, and carbon offsets
          </Text>
        </div>
        {combinedFeed.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-primary hover:text-primary/80"
          >
            View All History →
          </Button>
        )}
      </div>

      {combinedFeed.length === 0 ? (
        <EmptyState
          title="No Recent Activity Found"
          description="You haven't completed any pickups or wallet transactions yet. Book your first waste pickup to start earning points!"
          actionLabel="Schedule First Pickup"
          onAction={onViewAll}
        />
      ) : (
        <div className="space-y-3">
          {combinedFeed.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 hover:bg-background/80 border border-border/40 transition-colors duration-200"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-muted/80 border border-border/50 shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <Text variant="small" className="font-semibold text-foreground block truncate">
                    {item.title}
                  </Text>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Text variant="muted" className="text-[11px] text-muted-foreground font-mono">
                      {item.subtitle}
                    </Text>
                    {item.type === 'PICKUP_COMPLETED' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 ml-4">
                {item.amount && (
                  <span
                    className={`block font-mono font-bold text-sm ${item.amount.startsWith('+') ? 'text-emerald-400' : 'text-foreground'}`}
                  >
                    {item.amount}
                  </span>
                )}
                {item.points && (
                  <Badge
                    variant={item.points.startsWith('+') ? 'success' : 'default'}
                    size="sm"
                    className="font-mono text-[10px] mt-1"
                  >
                    {item.points}
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};
