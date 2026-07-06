import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Truck,
  QrCode,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, Heading, Text, Button, Skeleton, Badge, EmptyState } from '@/components/ui';
import { useMyPickups, type PickupRequest } from '../api/household.api';

interface UpcomingPickupCardProps {
  onBookPickup?: () => void;
  onViewTracking?: (pickupId: string) => void;
}

export const UpcomingPickupCard = ({ onBookPickup, onViewTracking }: UpcomingPickupCardProps) => {
  const { data: pickups, isLoading, isError, refetch } = useMyPickups();

  if (isLoading) {
    return (
      <Card className="p-6 md:p-8 border-border/50 bg-card/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4 w-full md:w-2/3">
            <div className="flex gap-2">
              <Skeleton variant="rectangular" width="100px" height="24px" />
              <Skeleton variant="rectangular" width="80px" height="24px" />
            </div>
            <Skeleton variant="text" width="50%" height="2rem" />
            <Skeleton variant="text" width="70%" height="1.2rem" />
          </div>
          <Skeleton variant="rectangular" width="160px" height="48px" />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 md:p-8 border-destructive/30 bg-destructive/5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Heading level={3} className="text-destructive">
              Unable to load upcoming pickups
            </Heading>
            <Text variant="small" className="text-muted-foreground mt-1">
              Could not fetch your scheduled pickup queue from NestJS dispatch servers.
            </Text>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => void refetch()}
          >
            Retry Dispatch Sync
          </Button>
        </div>
      </Card>
    );
  }

  // Filter for active pickups (not completed or cancelled)
  const activePickup = pickups?.find(
    (p: PickupRequest) =>
      p.status === 'SCHEDULED' ||
      p.status === 'IN_PROGRESS' ||
      p.status === 'ASSIGNED' ||
      p.status === 'ARRIVING',
  );

  if (!activePickup) {
    return (
      <Card className="p-8 border-dashed border-border/80 bg-card/40 backdrop-blur-md">
        <EmptyState
          title="No Upcoming Pickups Scheduled"
          description="Your pickup queue is empty. Schedule an AI-verified waste collection now to earn Green Points and cash rewards."
          actionLabel="Schedule Waste Pickup"
          onAction={onBookPickup}
        />
      </Card>
    );
  }

  const statusVariantMap: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
    SCHEDULED: 'info',
    ASSIGNED: 'warning',
    IN_PROGRESS: 'default',
    ARRIVING: 'default',
  };

  const statusBadgeVariant = statusVariantMap[activePickup.status] || 'info';
  const formattedDate = new Date(activePickup.scheduledDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = new Date(activePickup.scheduledDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="relative overflow-hidden p-6 md:p-8 border-primary/30 bg-gradient-to-r from-card/95 via-card/90 to-primary/10 backdrop-blur-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={statusBadgeVariant}
                className="uppercase font-mono tracking-wider font-bold"
              >
                {activePickup.status.replace('_', ' ')}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded-md bg-muted/60 border border-border/40">
                REF: #{activePickup.id.slice(0, 8)}
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" /> AI Verified
              </span>
            </div>

            <Heading level={2} className="text-xl md:text-2xl font-bold tracking-tight">
              Next Waste Collection:{' '}
              <span className="text-primary font-heading">
                {activePickup.estimatedWeightKg} kg estimated
              </span>
            </Heading>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/50">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <div className="truncate">
                  <Text
                    variant="small"
                    className="text-[10px] text-muted-foreground block uppercase font-mono"
                  >
                    Date
                  </Text>
                  <Text variant="small" className="text-xs font-semibold">
                    {formattedDate}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/50">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <Text
                    variant="small"
                    className="text-[10px] text-muted-foreground block uppercase font-mono"
                  >
                    Time Window
                  </Text>
                  <Text variant="small" className="text-xs font-semibold">
                    {formattedTime}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/50">
                <MapPin className="h-4 w-4 text-purple-400 shrink-0" />
                <div className="truncate">
                  <Text
                    variant="small"
                    className="text-[10px] text-muted-foreground block uppercase font-mono"
                  >
                    Pickup Address
                  </Text>
                  <Text variant="small" className="text-xs font-semibold truncate">
                    {activePickup.address?.label ||
                      activePickup.address?.street ||
                      'Primary Address'}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 self-stretch lg:self-center justify-end">
            <Button
              variant="primary"
              size="md"
              leftIcon={<QrCode className="h-4 w-4" />}
              onClick={() => onViewTracking && onViewTracking(activePickup.id)}
              className="w-full sm:w-auto lg:w-48 shadow-lg shadow-primary/20"
            >
              Show QR Secret
            </Button>

            <Button
              variant="outline"
              size="md"
              leftIcon={<Truck className="h-4 w-4" />}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => onViewTracking && onViewTracking(activePickup.id)}
              className="w-full sm:w-auto lg:w-48 bg-card/60"
            >
              Live Tracking
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
