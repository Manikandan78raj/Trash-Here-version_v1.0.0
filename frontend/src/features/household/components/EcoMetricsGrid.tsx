import { motion } from 'framer-motion';
import { Leaf, DollarSign, Award, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, Heading, Text, Button, Skeleton } from '@/components/ui';
import { useEcoScore, useWalletBalance } from '../api/household.api';

export const EcoMetricsGrid = () => {
  const {
    data: ecoMetrics,
    isLoading: isEcoLoading,
    isError: isEcoError,
    refetch: refetchEco,
  } = useEcoScore();

  const {
    data: wallet,
    isLoading: isWalletLoading,
    isError: isWalletError,
    refetch: refetchWallet,
  } = useWalletBalance();

  const isLoading = isEcoLoading || isWalletLoading;
  const isError = isEcoError || isWalletError;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 space-y-4 border-border/50 bg-card/60">
            <div className="flex items-center justify-between">
              <Skeleton variant="circular" width="40px" height="40px" />
              <Skeleton variant="text" width="30%" height="1rem" />
            </div>
            <Skeleton variant="text" width="60%" height="2rem" />
            <Skeleton variant="text" width="80%" height="1rem" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 border-destructive/30 bg-destructive/5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Heading level={3} className="text-destructive">
              Unable to load telemetry metrics
            </Heading>
            <Text variant="small" className="text-muted-foreground mt-1">
              Could not synchronize Eco Score and Wallet balances with NestJS servers.
            </Text>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => {
              void refetchEco();
              void refetchWallet();
            }}
          >
            Retry Sync
          </Button>
        </div>
      </Card>
    );
  }

  const ecoScore = ecoMetrics?.ecoScore ?? 0;
  const carbonSavedKg = ecoMetrics?.carbonSavedKg ?? 0;
  const balance = wallet?.cashBalance ?? wallet?.balance ?? 0;
  const greenPoints = wallet?.pointsBalance ?? wallet?.greenPoints ?? 0;
  const lifetimeEarnings = wallet?.totalCashEarned ?? wallet?.lifetimeEarnings ?? balance;

  const cards = [
    {
      title: 'Eco Score',
      value: `${ecoScore}`,
      subtitle: 'Out of 1,000 max points',
      icon: <Award className="h-6 w-6 text-primary" />,
      badge: '+12% month',
      bgGlow: 'from-primary/10 to-transparent',
      progress: Math.min(100, (ecoScore / 1000) * 100),
    },
    {
      title: 'Carbon Saved',
      value: `${carbonSavedKg.toFixed(1)} kg`,
      subtitle: `≈ ${(carbonSavedKg * 2.5).toFixed(0)} tree hours equivalent`,
      icon: <Leaf className="h-6 w-6 text-emerald-400" />,
      badge: `${ecoMetrics?.completedPickups ?? 0} pickups`,
      bgGlow: 'from-emerald-500/10 to-transparent',
      progress: Math.min(100, (carbonSavedKg / 100) * 100),
    },
    {
      title: 'Wallet Balance',
      value: `$${balance.toFixed(2)}`,
      subtitle: `Lifetime earned: $${lifetimeEarnings.toFixed(2)}`,
      icon: <DollarSign className="h-6 w-6 text-amber-400" />,
      badge: 'Available',
      bgGlow: 'from-amber-500/10 to-transparent',
      progress: 100,
    },
    {
      title: 'Green Points',
      value: `${greenPoints.toLocaleString()}`,
      subtitle: 'Redeemable in Rewards Store',
      icon: <TrendingUp className="h-6 w-6 text-purple-400" />,
      badge: 'Active',
      bgGlow: 'from-purple-500/10 to-transparent',
      progress: Math.min(100, (greenPoints / 5000) * 100),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
        >
          <Card
            className={`relative overflow-hidden p-6 border-border/60 bg-gradient-to-br ${card.bgGlow} bg-card/80 backdrop-blur-xl shadow-lg hover:border-primary/40 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-background/80 border border-border/50 shadow-sm">
                {card.icon}
              </div>
              <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-muted/80 text-muted-foreground border border-border/40">
                {card.badge}
              </span>
            </div>

            <Text variant="small" className="text-muted-foreground font-medium block">
              {card.title}
            </Text>

            <Heading level={2} className="text-2xl md:text-3xl font-bold font-heading mt-1">
              {card.value}
            </Heading>

            <Text variant="muted" className="text-xs text-muted-foreground mt-2 block truncate">
              {card.subtitle}
            </Text>

            {/* Subtle progress indicator */}
            <div className="mt-4 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${card.progress}%` }}
              />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
