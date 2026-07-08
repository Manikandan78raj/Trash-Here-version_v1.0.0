import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/common/layouts/AppLayout';
import { ErrorBoundary } from '@/common/routing/ErrorBoundary';
import { Skeleton } from '@/components/ui';

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

const RecyclerWorkspacePage = lazy(() =>
  import('@/features/recycler/pages/RecyclerWorkspacePage').then((module) => ({
    default: module.RecyclerWorkspacePage,
  })),
);

const AdminWorkspacePage = lazy(() =>
  import('@/features/admin/pages/AdminWorkspacePage').then((module) => ({
    default: module.AdminWorkspacePage,
  })),
);

const AiWorkspacePage = lazy(() =>
  import('@/features/ai/pages/AiWorkspacePage').then((module) => ({
    default: module.AiWorkspacePage,
  })),
);

// Marketing & SEO Hub Lazy Loading
const PublicLayout = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.PublicLayout })),
);
const HomePage = lazy(() => import('@/features/marketing').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.AboutPage })),
);
const FeaturesPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.FeaturesPage })),
);
const HowItWorksPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.HowItWorksPage })),
);
const EcoCalculatorPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.EcoCalculatorPage })),
);
const PricingPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.PricingPage })),
);
const BusinessSolutionsPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.BusinessSolutionsPage })),
);
const CollectorsPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.CollectorsPage })),
);
const RecyclersPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.RecyclersPage })),
);
const PartnersPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.PartnersPage })),
);
const TestimonialsPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.TestimonialsPage })),
);
const FaqPage = lazy(() => import('@/features/marketing').then((m) => ({ default: m.FaqPage })));
const BlogListingPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.BlogListingPage })),
);
const BlogDetailPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.BlogDetailPage })),
);
const CareersListingPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.CareersListingPage })),
);
const CareerDetailPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.CareerDetailPage })),
);
const ContactPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.ContactPage })),
);
const InvestorRelationsPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.InvestorRelationsPage })),
);
const PrivacyPolicyPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.PrivacyPolicyPage })),
);
const TermsConditionsPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.TermsConditionsPage })),
);
const CookiesPolicyPage = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.CookiesPolicyPage })),
);
const Custom404Page = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.Custom404Page })),
);

const PageLoadingFallback: React.FC = () => (
  <div className="space-y-6 p-6 min-h-screen bg-slate-950 text-slate-100">
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
          {/* Public Marketing Website & SEO Hub */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="features" element={<FeaturesPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="eco-calculator" element={<EcoCalculatorPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="business" element={<BusinessSolutionsPage />} />
            <Route path="collectors" element={<CollectorsPage />} />
            <Route path="recyclers" element={<RecyclersPage />} />
            <Route path="partners" element={<PartnersPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="blog" element={<BlogListingPage />} />
            <Route path="blog/:slug" element={<BlogDetailPage />} />
            <Route path="careers" element={<CareersListingPage />} />
            <Route path="careers/:slug" element={<CareerDetailPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="investor-relations" element={<InvestorRelationsPage />} />
            <Route path="privacy" element={<PrivacyPolicyPage />} />
            <Route path="terms" element={<TermsConditionsPage />} />
            <Route path="cookies" element={<CookiesPolicyPage />} />
          </Route>

          {/* Internal Logged-In Application & Dashboards */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<HouseholdDashboard />} />
            <Route path="book" element={<PickupBookingPage />} />
            <Route path="tracking" element={<LivePickupTrackingPage />} />
            <Route path="pickups/:id" element={<LivePickupTrackingPage />} />
            <Route path="wallet" element={<WalletDashboardPage />} />
            <Route path="rewards" element={<RewardsStorePage />} />
            <Route path="subscriptions" element={<SubscriptionPage />} />
            <Route path="settings" element={<HubPage />} />
            <Route path="profile" element={<HubPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="showcase" element={<DesignSystemShowcase />} />
            <Route path="*" element={<HouseholdDashboard />} />
          </Route>

          <Route
            path="/collector/*"
            element={
              <AppLayout>
                <CollectorWorkspacePage />
              </AppLayout>
            }
          />

          <Route
            path="/recycler/*"
            element={
              <AppLayout>
                <RecyclerWorkspacePage />
              </AppLayout>
            }
          />

          <Route
            path="/admin/*"
            element={
              <AppLayout>
                <AdminWorkspacePage />
              </AppLayout>
            }
          />

          <Route
            path="/ai/*"
            element={
              <AppLayout>
                <AiWorkspacePage />
              </AppLayout>
            }
          />

          <Route path="*" element={<Custom404Page />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
