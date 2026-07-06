import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/common/layouts/AppLayout';
import { ErrorBoundary } from '@/common/routing/ErrorBoundary';
import { Heading, Text, Card, Skeleton } from '@/components/ui';

// Lazy load named exports for optimal code splitting & bundle performance
const DesignSystemShowcase = lazy(() =>
  import('@/pages/DesignSystemShowcase').then((module) => ({
    default: module.DesignSystemShowcase,
  })),
);

const HouseholdDashboard = lazy(() =>
  import('@/features/household/pages/HouseholdDashboard').then((module) => ({
    default: module.HouseholdDashboard,
  })),
);

const PickupBookingPage = lazy(() =>
  import('@/features/household/pages/PickupBookingPage').then((module) => ({
    default: module.PickupBookingPage,
  })),
);

const LivePickupTrackingPage = lazy(() =>
  import('@/features/household/pages/LivePickupTrackingPage').then((module) => ({
    default: module.LivePickupTrackingPage,
  })),
);

const WalletDashboardPage = lazy(() =>
  import('@/features/household/pages/WalletDashboardPage').then((module) => ({
    default: module.WalletDashboardPage,
  })),
);

const RewardsStorePage = lazy(() =>
  import('@/features/household/pages/RewardsStorePage').then((module) => ({
    default: module.RewardsStorePage,
  })),
);

const SubscriptionPage = lazy(() =>
  import('@/features/household/pages/SubscriptionPage').then((module) => ({
    default: module.SubscriptionPage,
  })),
);

const HubPage = lazy(() =>
  import('@/features/hub/pages/HubPage').then((module) => ({
    default: module.HubPage,
  })),
);

const NotificationsPage = lazy(() =>
  import('@/features/hub/pages/NotificationsPage').then((module) => ({
    default: module.NotificationsPage,
  })),
);

const CollectorWorkspacePage = lazy(() =>
  import('@/features/collector/pages/CollectorWorkspacePage').then((module) => ({
    default: module.CollectorWorkspacePage,
  })),
);

const PageLoadingFallback: React.FC = () => (
  <div className="space-y-6 p-6">
    <div className="flex items-center justify-between">
      <Skeleton variant="text" width="40%" height="3rem" />
      <Skeleton variant="rectangular" width="120px" height="2.5rem" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton variant="rectangular" height="160px" />
      <Skeleton variant="rectangular" height="160px" />
      <Skeleton variant="rectangular" height="160px" />
    </div>
    <Skeleton variant="rectangular" height="300px" />
  </div>
);

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DesignSystemShowcase />} />
            <Route path="app" element={<HouseholdDashboard />} />
            <Route path="app/book" element={<PickupBookingPage />} />
            <Route path="app/tracking" element={<LivePickupTrackingPage />} />
            <Route path="app/pickups/:id" element={<LivePickupTrackingPage />} />
            <Route path="app/wallet" element={<WalletDashboardPage />} />
            <Route path="app/rewards" element={<RewardsStorePage />} />
            <Route path="app/subscriptions" element={<SubscriptionPage />} />
            <Route path="app/settings" element={<HubPage />} />
            <Route path="app/profile" element={<HubPage />} />
            <Route path="app/notifications" element={<NotificationsPage />} />
            <Route path="app/*" element={<HouseholdDashboard />} />
            <Route path="collector/*" element={<CollectorWorkspacePage />} />
            <Route
              path="admin/*"
              element={
                <Card className="p-12 text-center max-w-2xl mx-auto my-12 space-y-4">
                  <Heading level={2}>Enterprise Admin Dashboard</Heading>
                  <Text variant="muted">
                    Scheduled for development in Milestone 5. This area will host system revenue
                    analytics, user tables, and waste pricing management.
                  </Text>
                </Card>
              }
            />
          </Route>
          <Route
            path="*"
            element={
              <div className="flex h-screen items-center justify-center p-4">
                <Card className="p-10 text-center max-w-md">
                  <Heading level={2}>404 — Page Not Found</Heading>
                  <Text variant="muted" className="mt-2">
                    The requested workspace or route does not exist.
                  </Text>
                </Card>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
