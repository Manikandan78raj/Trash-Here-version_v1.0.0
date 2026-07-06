import React, { useState } from 'react';
import { Card, Heading, Text, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import { useRewards, useMyVouchers, useRedeemReward, useWalletDashboard } from '../api/wallet.api';
import { toast } from '@/common/notifications/toast';

export const RewardsStorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-vouchers'>('catalog');
  const { data: rewards, isLoading: rewardsLoading } = useRewards();
  const { data: vouchers, isLoading: vouchersLoading } = useMyVouchers();
  const { data: dashboard } = useWalletDashboard();
  const redeemMutation = useRedeemReward();

  const userPoints = dashboard?.wallet?.pointsBalance || 0;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied promo code "${code}" to clipboard!`);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <Card className="p-8 rounded-[30px] bg-gradient-to-r from-zinc-900 via-zinc-900 to-black text-white border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[rgb(215,255,67)]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <Badge variant="success" className="bg-[rgb(215,255,67)] text-black font-bold">
            Eco Rewards Catalog
          </Badge>
          <Heading level={2} className="text-white">
            Redeem Green Points
          </Heading>
          <Text variant="muted" className="text-zinc-300 max-w-xl">
            Convert your recycling achievements into exclusive discounts and vouchers from
            sustainable partner brands.
          </Text>
        </div>
        <div className="bg-zinc-800/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-zinc-700/60 text-right relative z-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
            Your Green Points
          </span>
          <span className="text-3xl font-black text-[rgb(215,255,67)]">
            {userPoints.toLocaleString()}{' '}
            <span className="text-sm font-normal text-white">pts</span>
          </span>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 font-bold text-base transition-all relative ${
            activeTab === 'catalog'
              ? 'text-black dark:text-white'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          Partner Catalog
          {activeTab === 'catalog' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[rgb(215,255,67)] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('my-vouchers')}
          className={`pb-3 px-4 font-bold text-base transition-all relative flex items-center gap-2 ${
            activeTab === 'my-vouchers'
              ? 'text-black dark:text-white'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          My Vouchers
          {vouchers && vouchers.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-[rgb(215,255,67)] text-black font-black">
              {vouchers.length}
            </span>
          )}
          {activeTab === 'my-vouchers' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[rgb(215,255,67)] rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Content: Catalog */}
      {activeTab === 'catalog' && (
        <div>
          {rewardsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton variant="rectangular" height="280px" className="rounded-[30px]" />
              <Skeleton variant="rectangular" height="280px" className="rounded-[30px]" />
              <Skeleton variant="rectangular" height="280px" className="rounded-[30px]" />
            </div>
          ) : !rewards || rewards.length === 0 ? (
            <EmptyState
              title="No rewards available"
              description="Check back soon for new partner brand vouchers and sustainable discounts."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rewards.map((reward) => {
                const canAfford = userPoints >= reward.pointsCost;
                return (
                  <Card
                    key={reward.id}
                    className="p-6 rounded-[30px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge
                          variant="secondary"
                          className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold px-3 py-1"
                        >
                          {reward.partnerName}
                        </Badge>
                        <span className="text-lg font-black text-emerald-600 dark:text-[rgb(215,255,67)]">
                          {reward.discountValue}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <Heading level={4}>{reward.title}</Heading>
                        <Text variant="muted" className="text-xs line-clamp-2">
                          {reward.description}
                        </Text>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/80 mt-6 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-zinc-400 block font-medium">Cost</span>
                        <span className="text-xl font-extrabold text-black dark:text-white">
                          {reward.pointsCost} <span className="text-xs font-normal">pts</span>
                        </span>
                      </div>

                      <Button
                        variant={canAfford ? 'primary' : 'secondary'}
                        onClick={() => redeemMutation.mutate({ rewardId: reward.id })}
                        disabled={!canAfford || redeemMutation.isPending}
                        className={`rounded-2xl px-5 py-2.5 font-bold text-sm ${
                          canAfford
                            ? 'bg-[rgb(215,255,67)] hover:bg-[rgb(195,235,47)] text-black shadow-md shadow-[rgb(215,255,67)]/20'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                        }`}
                      >
                        {redeemMutation.isPending ? '...' : canAfford ? 'Redeem' : 'Need Points'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: My Vouchers */}
      {activeTab === 'my-vouchers' && (
        <div>
          {vouchersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton variant="rectangular" height="160px" className="rounded-[30px]" />
              <Skeleton variant="rectangular" height="160px" className="rounded-[30px]" />
            </div>
          ) : !vouchers || vouchers.length === 0 ? (
            <EmptyState
              title="No vouchers redeemed yet"
              description="Redeem your Green Points in the catalog to unlock promo codes and discounts!"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vouchers.map((item) => (
                <Card
                  key={item.id}
                  className="p-6 rounded-[30px] border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/60 shadow-lg flex flex-col justify-between space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge
                        variant="success"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold mb-2"
                      >
                        {item.status}
                      </Badge>
                      <Heading level={4}>{item.reward?.title || 'Discount Voucher'}</Heading>
                      <Text variant="muted" className="text-xs">
                        Redeemed on {new Date(item.redeemedAt).toLocaleDateString()}
                      </Text>
                    </div>
                    <span className="text-xl font-black text-emerald-600 dark:text-[rgb(215,255,67)]">
                      {item.reward?.discountValue || 'VOUCHER'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
                    <span className="font-mono font-bold tracking-wider text-base text-black dark:text-white pl-2">
                      {item.redeemedCode}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => handleCopyCode(item.redeemedCode)}
                      className="rounded-xl px-4 py-1.5 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      Copy Code
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
