import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { EcoMetricsGrid } from '../components/EcoMetricsGrid';
import { UpcomingPickupCard } from '../components/UpcomingPickupCard';
import { QuickActionsGrid } from '../components/QuickActionsGrid';
import { RecentActivityList } from '../components/RecentActivityList';
import { RecyclingTipsCard } from '../components/RecyclingTipsCard';
import { NotificationsPreview } from '../components/NotificationsPreview';
import { toast } from '@/common/notifications/toast';

export const HouseholdDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleBookPickup = () => {
    navigate('/app/book');
  };

  const handleViewHistory = () => {
    toast.info('Complete Pickup Logs & Analytics scheduled for Milestone 3.4!');
  };

  const handleViewRewards = () => {
    toast.info('Rewards Store & Voucher Catalog scheduled for Milestone 3.4!');
  };

  const handleViewWallet = () => {
    toast.info('Stripe Instant Payouts & Wallet Management scheduled for Milestone 3.4!');
  };

  const handleViewTracking = (pickupId: string) => {
    navigate(`/app/pickups/${pickupId}`);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* 1. Welcome Banner */}
      <WelcomeBanner />

      {/* 2. Eco Metrics Grid (Eco Score, Carbon Saved, Wallet Balance, Green Points) */}
      <EcoMetricsGrid />

      {/* 3. Upcoming Pickup Card / Active Queue */}
      <UpcomingPickupCard onBookPickup={handleBookPickup} onViewTracking={handleViewTracking} />

      {/* 4. Quick Actions Grid */}
      <QuickActionsGrid
        onBookPickup={handleBookPickup}
        onViewHistory={handleViewHistory}
        onViewRewards={handleViewRewards}
        onViewWallet={handleViewWallet}
      />

      {/* 5. Activity Ledger & Notifications Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <RecentActivityList onViewAll={handleViewHistory} />
        </div>
        <div className="space-y-8">
          <NotificationsPreview />
        </div>
      </div>

      {/* 6. Recycling Tips & Market Insights */}
      <RecyclingTipsCard />
    </div>
  );
};

export default HouseholdDashboard;
