import React from 'react';
import {
  Truck,
  DollarSign,
  Star,
  CheckCircle,
  Radio,
  MapPin,
  Navigation,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useCollectorDashboardStats,
  useAvailableJobs,
  useAcceptJob,
  useToggleOnlineStatus,
  type CollectorJob,
} from '../api/collector.api';

interface CollectorDashboardTabProps {
  onNavigateToRoute: () => void;
  onOpenScanner: (job: {
    id: string;
    lat?: number;
    lng?: number;
    customerName?: string;
    addressLabel?: string;
    weight?: number;
  }) => void;
}

export const CollectorDashboardTab: React.FC<CollectorDashboardTabProps> = ({
  onNavigateToRoute,
  onOpenScanner,
}) => {
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useCollectorDashboardStats();
  const {
    data: jobs = [],
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useAvailableJobs(stats?.currentLat, stats?.currentLng);

  const acceptJobMutation = useAcceptJob();
  const toggleStatusMutation = useToggleOnlineStatus();

  const handleToggleOnline = () => {
    if (stats) {
      toggleStatusMutation.mutate(!stats.isOnline);
    }
  };

  const handleAcceptJob = (pickupId: string) => {
    acceptJobMutation.mutate(pickupId);
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton variant="rectangular" height="120px" />
          <Skeleton variant="rectangular" height="120px" />
          <Skeleton variant="rectangular" height="120px" />
          <Skeleton variant="rectangular" height="120px" />
        </div>
        <Skeleton variant="rectangular" height="300px" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Fleet Status Banner */}
      <Card className="p-6 bg-gradient-to-r from-card to-muted/30 border-border/60 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/20 text-primary glow-primary font-black text-2xl shadow-sm">
              <Truck className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Vehicle: {stats?.vehicleType || 'Electric Eco-Van'}
                </h2>
                <Badge variant={stats?.isOnline ? 'success' : 'neutral'}>
                  {stats?.isOnline ? '🟢 ONLINE & DISPATCHING' : '⚪ OFFLINE'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Plate:{' '}
                <span className="font-mono font-semibold text-foreground">
                  {stats?.vehiclePlate || 'ECO-2026'}
                </span>{' '}
                • Max Capacity: {stats?.maxCapacityKg || 1000} kg
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchStats();
                refetchJobs();
              }}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button
              variant={stats?.isOnline ? 'outline' : 'primary'}
              size="md"
              onClick={handleToggleOnline}
              disabled={toggleStatusMutation.isPending}
              className={
                !stats?.isOnline
                  ? 'glow-primary font-bold px-6'
                  : 'text-destructive border-destructive/40 hover:bg-destructive/10'
              }
            >
              <Radio className="h-4 w-4 mr-1.5 animate-pulse" />
              {stats?.isOnline ? 'Go Offline' : 'Go Online Now'}
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2 border-border/50 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Earnings</span>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-heading font-black text-foreground">
            ${(stats?.totalEarnings || 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Lifetime verified payouts</p>
        </Card>

        <Card className="p-5 space-y-2 border-border/50 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Jobs</span>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-heading font-black text-foreground">
            {stats?.totalCompleted || 0}
          </div>
          <p className="text-xs text-muted-foreground">Verified pickups delivered</p>
        </Card>

        <Card className="p-5 space-y-2 border-border/50 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Collector Rating</span>
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-heading font-black text-foreground flex items-baseline gap-1">
            {(stats?.rating || 5.0).toFixed(1)}{' '}
            <span className="text-sm font-normal text-muted-foreground">/ 5.0</span>
          </div>
          <p className="text-xs text-muted-foreground">Top tier verified eco-fleet</p>
        </Card>

        <Card className="p-5 space-y-2 border-border/50 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Active Route Status</span>
            <Navigation className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-lg font-heading font-bold text-foreground truncate">
            {stats?.activeJob ? `Stop: ${stats.activeJob.status}` : 'No Active Stop'}
          </div>
          <div className="pt-0.5">
            {stats?.activeJob ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-primary p-0"
                onClick={onNavigateToRoute}
              >
                View Polyline Route <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Accept a job below to route</p>
            )}
          </div>
        </Card>
      </div>

      {/* Active Job Highlight Widget (if any) */}
      {stats?.activeJob && (
        <Card className="p-6 border-primary/60 bg-primary/5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="animate-pulse">
                ⚡ ACTIVE TARGET STOP
              </Badge>
              <span className="text-sm font-bold text-foreground">
                Status: {stats.activeJob.status}
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                onOpenScanner({
                  id: stats.activeJob!.id,
                  lat: stats.activeJob!.address.lat,
                  lng: stats.activeJob!.address.lng,
                  customerName: stats.activeJob!.user?.fullName || 'Household Customer',
                  addressLabel: `${stats.activeJob!.address.street}, ${stats.activeJob!.address.city}`,
                  weight: stats.activeJob!.estimatedWeightKg,
                })
              }
              className="glow-primary font-bold"
            >
              📷 Scan QR & Complete
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Address</span>
              <p className="font-semibold text-foreground">
                {stats.activeJob.address.street}, {stats.activeJob.address.city},{' '}
                {stats.activeJob.address.state}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase">
                Customer Contact
              </span>
              <p className="font-semibold text-foreground">
                {stats.activeJob.user?.fullName || 'Household Member'}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.activeJob.user?.phone || '+1 (555) 019-2831'}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase">
                Estimated Load
              </span>
              <p className="font-semibold text-foreground">
                {stats.activeJob.estimatedWeightKg} kg recyclable waste
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Available Nearby Jobs Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Available Nearby Pickups
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time dispatch feed sorted by GPS proximity
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {jobs.length} Requests Found
          </Badge>
        </div>

        {jobsLoading ? (
          <div className="space-y-3">
            <Skeleton variant="rectangular" height="90px" />
            <Skeleton variant="rectangular" height="90px" />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No Nearby Pickups Right Now"
            description="You are all caught up! Make sure you are ONLINE to receive new household pickup requests as they are booked."
            icon={<ShieldCheck className="h-8 w-8 text-primary" />}
            actionLabel="Refresh Feed"
            onAction={refetchJobs}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job: CollectorJob) => (
              <Card
                key={job.id}
                className="p-5 space-y-4 border-border/60 hover:border-primary/50 transition-all duration-200 bg-card/90"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="info">NEW REQUEST</Badge>
                      <span className="text-xs font-bold text-muted-foreground">
                        {new Date(job.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-foreground text-base">
                      {job.address.street}, {job.address.city}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" /> Customer:{' '}
                      {job.user?.fullName || 'Eco Citizen'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary font-mono">
                      ${(job.estimatedWeightKg * 2.5).toFixed(2)}
                    </span>
                    <p className="text-[11px] text-muted-foreground">Est. Payout</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    📦 Load: ~{job.estimatedWeightKg} kg
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAcceptJob(job.id)}
                    disabled={acceptJobMutation.isPending}
                    className="glow-primary font-bold text-xs h-8 px-4"
                  >
                    ⚡ Accept & Route
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
