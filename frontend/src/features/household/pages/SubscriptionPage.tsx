import React from 'react';
import { Card, Heading, Text, Button, Badge, Skeleton } from '@/components/ui';
import { useCurrentSubscription, useSubscribe, useCancelSubscription } from '../api/wallet.api';

export const SubscriptionPage: React.FC = () => {
  const { data: currentSub, isLoading } = useCurrentSubscription();
  const subscribeMutation = useSubscribe();
  const cancelMutation = useCancelSubscription();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" height="200px" className="rounded-[30px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton variant="rectangular" height="350px" className="rounded-[30px]" />
          <Skeleton variant="rectangular" height="350px" className="rounded-[30px]" />
        </div>
      </div>
    );
  }

  const isStarter = currentSub?.planName === 'Eco Starter' && currentSub?.status === 'ACTIVE';
  const isPro = currentSub?.planName === 'Eco Pro' && currentSub?.status === 'ACTIVE';

  return (
    <div className="space-y-8">
      {currentSub && currentSub.status === 'ACTIVE' && (
        <Card className="p-6 rounded-[30px] bg-gradient-to-r from-emerald-900/40 to-black/80 border border-emerald-500/30 backdrop-blur-md text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="bg-[rgb(215,255,67)] text-black font-bold">
                Active Plan
              </Badge>
              <span className="text-xs text-zinc-400">
                Renews {new Date(currentSub.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
            <Heading level={3} className="text-white mt-1">
              {currentSub.planName} (${currentSub.priceMonthly}/mo)
            </Heading>
            <Text variant="muted" className="text-zinc-300">
              Includes {currentSub.pickupsPerMonth} scheduled waste pickups per month & bonus point
              multipliers.
            </Text>
          </div>
          <Button
            variant="ghost"
            onClick={() => cancelMutation.mutate({ reason: 'User requested cancellation' })}
            disabled={cancelMutation.isPending}
            className="text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-2xl px-4"
          >
            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
          </Button>
        </Card>
      )}

      <div className="text-center max-w-2xl mx-auto space-y-2">
        <Heading level={2}>Eco Subscription Plans</Heading>
        <Text variant="muted">
          Automate your recycling schedule and unlock multiplier rewards for every kilogram saved.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Eco Starter */}
        <Card
          className={`p-8 rounded-[30px] border transition-all duration-300 flex flex-col justify-between ${
            isStarter
              ? 'border-[rgb(215,255,67)] shadow-2xl shadow-[rgb(215,255,67)]/10 bg-zinc-900/90 text-white'
              : 'border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 hover:shadow-xl'
          }`}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                For Individuals
              </span>
              <div className="flex justify-between items-baseline">
                <Heading level={3}>Eco Starter</Heading>
                <span className="text-3xl font-extrabold">
                  $19<span className="text-sm font-normal text-zinc-500">/mo</span>
                </span>
              </div>
              <Text variant="muted" className="text-sm">
                Perfect for routine household waste & recycling pickups.
              </Text>
            </div>

            <ul className="space-y-3 text-sm border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <li className="flex items-center gap-3">
                <span className="text-[rgb(215,255,67)] font-bold">✓</span>
                <span>
                  <strong>2 Scheduled Pickups</strong> per month
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[rgb(215,255,67)] font-bold">✓</span>
                <span>Standard AI Waste Classification</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[rgb(215,255,67)] font-bold">✓</span>
                <span>
                  <strong>1.1x Multiplier</strong> on Green Points
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[rgb(215,255,67)] font-bold">✓</span>
                <span>Verified Carbon Saved Certificate</span>
              </li>
            </ul>
          </div>

          <Button
            variant={isStarter ? 'secondary' : 'primary'}
            onClick={() => subscribeMutation.mutate({ planName: 'Eco Starter' })}
            disabled={isStarter || subscribeMutation.isPending}
            className={`w-full mt-8 py-4 rounded-2xl font-bold text-base ${
              isStarter
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-[rgb(215,255,67)] hover:bg-[rgb(195,235,47)] text-black shadow-lg shadow-[rgb(215,255,67)]/20'
            }`}
          >
            {isStarter
              ? 'Current Plan'
              : subscribeMutation.isPending
                ? 'Enrolling...'
                : 'Select Eco Starter'}
          </Button>
        </Card>

        {/* Eco Pro */}
        <Card
          className={`p-8 rounded-[30px] border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
            isPro
              ? 'border-[rgb(215,255,67)] shadow-2xl shadow-[rgb(215,255,67)]/20 bg-zinc-900 text-white'
              : 'border-zinc-800 bg-gradient-to-br from-zinc-900 to-black text-white hover:border-zinc-700 hover:shadow-2xl'
          }`}
        >
          <div className="absolute top-0 right-0 bg-[rgb(215,255,67)] text-black text-xs font-black px-4 py-1 rounded-bl-2xl uppercase tracking-wider">
            Popular
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[rgb(215,255,67)]">
                For Eco Champions
              </span>
              <div className="flex justify-between items-baseline">
                <Heading level={3} className="text-white">
                  Eco Pro
                </Heading>
                <span className="text-3xl font-extrabold text-[rgb(215,255,67)]">
                  $49<span className="text-sm font-normal text-zinc-400">/mo</span>
                </span>
              </div>
              <Text variant="muted" className="text-sm text-zinc-300">
                Maximum convenience, priority collector routing & high multipliers.
              </Text>
            </div>

            <ul className="space-y-3 text-sm border-t border-zinc-800 pt-6 text-zinc-200">
              <li className="flex items-center gap-3">
                <span className="text-[rgb(215,255,67)] font-bold">✓</span>
                <span>
                  <strong>5 Scheduled Pickups</strong> per month
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[rgb(215,255,67)] font-bold">✓</span>
                <span>Priority Collector Routing & Instant Payouts</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[rgb(215,255,67)] font-bold">✓</span>
                <span>
                  <strong>1.5x Multiplier</strong> on Green Points
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[rgb(215,255,67)] font-bold">✓</span>
                <span>Dedicated 24/7 Support & ESG Reporting</span>
              </li>
            </ul>
          </div>

          <Button
            variant={isPro ? 'secondary' : 'primary'}
            onClick={() => subscribeMutation.mutate({ planName: 'Eco Pro' })}
            disabled={isPro || subscribeMutation.isPending}
            className={`w-full mt-8 py-4 rounded-2xl font-bold text-base ${
              isPro
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-[rgb(215,255,67)] hover:bg-[rgb(195,235,47)] text-black shadow-lg shadow-[rgb(215,255,67)]/30 transform active:scale-[0.98]'
            }`}
          >
            {isPro
              ? 'Current Plan'
              : subscribeMutation.isPending
                ? 'Enrolling...'
                : 'Select Eco Pro'}
          </Button>
        </Card>
      </div>
    </div>
  );
};
