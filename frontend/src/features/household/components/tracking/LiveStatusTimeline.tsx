import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  UserCheck,
  CheckCircle2,
  Truck,
  MapPin,
  QrCode,
  PartyPopper,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { useSimulatePickupStatus } from '../../api/household.api';

export interface LiveStatusTimelineProps {
  pickupId: string;
  currentStatus: string;
  scheduledDate: string;
  isCancelled?: boolean;
}

interface TimelineStep {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  timeEstimate: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    key: 'PENDING',
    label: 'Request Pending',
    description: 'AI verified waste items. Searching for nearby online collector...',
    icon: <Clock className="h-4 w-4" />,
    timeEstimate: 'Just now',
  },
  {
    key: 'ASSIGNED',
    label: 'Collector Assigned',
    description: 'Smart matchmaker assigned an electric waste van.',
    icon: <UserCheck className="h-4 w-4" />,
    timeEstimate: '< 2 mins',
  },
  {
    key: 'COLLECTOR_ACCEPTED',
    label: 'Job Accepted',
    description: 'Collector reviewed manifest and accepted the dispatch.',
    icon: <CheckCircle2 className="h-4 w-4" />,
    timeEstimate: '2 mins ago',
  },
  {
    key: 'EN_ROUTE',
    label: 'Driver En Route',
    description: 'Collector is driving to your pickup address. Live GPS active.',
    icon: <Truck className="h-4 w-4" />,
    timeEstimate: 'ETA 12 mins',
  },
  {
    key: 'ARRIVED',
    label: 'Driver Arrived',
    description: 'Collector has arrived at your location. Please have waste ready.',
    icon: <MapPin className="h-4 w-4" />,
    timeEstimate: 'Now',
  },
  {
    key: 'VERIFIED',
    label: 'QR Verification & Weigh-in',
    description: 'Collector scanning QR code and recording verified digital weight.',
    icon: <QrCode className="h-4 w-4" />,
    timeEstimate: 'In progress',
  },
  {
    key: 'COMPLETED',
    label: 'Pickup Completed',
    description: 'Waste collected! Green Points and instant cash payout awarded.',
    icon: <PartyPopper className="h-4 w-4" />,
    timeEstimate: 'Done',
  },
];

export const LiveStatusTimeline: React.FC<LiveStatusTimelineProps> = ({
  pickupId,
  currentStatus,
  scheduledDate,
  isCancelled = false,
}) => {
  const simulateStatusMutation = useSimulatePickupStatus();

  // Normalize status for matching (handle IN_PROGRESS vs VERIFIED)
  const normalizedStatus =
    currentStatus === 'IN_PROGRESS' || currentStatus === 'SCHEDULED' ? 'VERIFIED' : currentStatus;

  // Find index of current status in timeline
  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === normalizedStatus);
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  const handleSimulateStep = (statusKey: string) => {
    simulateStatusMutation.mutate({ id: pickupId, status: statusKey });
  };

  if (isCancelled || currentStatus === 'CANCELLED') {
    return (
      <Card className="p-6 border-destructive/30 bg-destructive/5 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">Pickup Request Cancelled</h3>
              <Badge variant="error" size="sm" className="font-mono text-[10px]">
                TERMINATED
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This pickup request was cancelled before arrival. No charges or penalties apply.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-border/60 bg-card/80 rounded-3xl shadow-xl backdrop-blur-md overflow-hidden">
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-inner">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight">
              Live Dispatch Timeline
            </h3>
            <p className="text-xs font-mono text-muted-foreground">
              Scheduled: {new Date(scheduledDate).toLocaleDateString()} • SLA Active
            </p>
          </div>
        </div>
        <Badge
          variant={normalizedStatus === 'COMPLETED' ? 'success' : 'default'}
          className="font-mono text-xs px-3 py-1 font-bold tracking-wider animate-pulse"
        >
          {normalizedStatus.replace('_', ' ')}
        </Badge>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-primary/50 before:to-border">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index < activeIndex || normalizedStatus === 'COMPLETED';
          const isCurrent = index === activeIndex && normalizedStatus !== 'COMPLETED';
          const isUpcoming = index > activeIndex && normalizedStatus !== 'COMPLETED';

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex items-start gap-4 group"
            >
              {/* Step Indicator Dot */}
              <div
                className={`absolute -left-6 top-0.5 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground shadow-primary/30 scale-100'
                    : isCurrent
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110 animate-pulse'
                      : 'bg-muted text-muted-foreground ring-2 ring-border scale-90'
                }`}
              >
                {step.icon}
              </div>

              {/* Step Content */}
              <div className={`flex-1 transition-all ${isUpcoming ? 'opacity-40' : 'opacity-100'}`}>
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-bold tracking-tight ${
                      isCurrent ? 'text-primary font-extrabold text-base' : 'text-foreground'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      isCurrent
                        ? 'bg-primary/20 text-primary font-bold animate-pulse'
                        : isCompleted
                          ? 'bg-muted text-muted-foreground'
                          : 'text-muted-foreground/60'
                    }`}
                  >
                    {isCompleted ? '✓ Done' : step.timeEstimate}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Developer / Demo Interactive Simulation Bar */}
      <div className="mt-8 pt-6 border-t border-border/50 bg-muted/30 -mx-6 -mb-6 p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Interactive Telemetry Simulator (Demo Mode)
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">Click to trigger</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TIMELINE_STEPS.map((step) => (
            <Button
              key={step.key}
              type="button"
              variant={step.key === normalizedStatus ? 'primary' : 'outline'}
              size="sm"
              disabled={simulateStatusMutation.isPending}
              onClick={() => handleSimulateStep(step.key)}
              className="text-[10px] font-mono h-7 px-2.5 rounded-xl"
            >
              {step.key.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};
