import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  CheckCircle2,
  Clock,
  Route as RouteIcon,
  Send,
  Sparkles,
  Compass,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useAssignedRoute,
  useArriveAtStop,
  useUpdateLocation,
  type CollectorRouteWaypoint,
} from '../api/collector.api';

interface CollectorRouteTabProps {
  onOpenScanner: (job: {
    id: string;
    lat?: number;
    lng?: number;
    customerName?: string;
    addressLabel?: string;
    weight?: number;
  }) => void;
}

export const CollectorRouteTab: React.FC<CollectorRouteTabProps> = ({ onOpenScanner }) => {
  const { data: route, isLoading, refetch } = useAssignedRoute();
  const arriveMutation = useArriveAtStop();
  const updateLocMutation = useUpdateLocation();
  const [simStep, setSimStep] = useState<number>(0);

  const handleArrive = (pickupId: string) => {
    arriveMutation.mutate(pickupId);
  };

  const handleSimulateGps = () => {
    // Simulate moving along GPS coordinates
    const simCoords = [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7765, lng: -122.418 },
      { lat: 37.778, lng: -122.4165 },
      { lat: 37.78, lng: -122.415 },
    ];
    const nextStep = (simStep + 1) % simCoords.length;
    setSimStep(nextStep);
    updateLocMutation.mutate(simCoords[nextStep]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" height="240px" />
        <Skeleton variant="rectangular" height="400px" />
      </div>
    );
  }

  const waypoints = route?.waypoints || [];

  return (
    <div className="space-y-8">
      {/* Route Overview Header Card */}
      <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 border-border/60 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary text-primary-foreground font-black text-2xl shadow-md glow-primary">
              <Navigation className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Optimized Polyline Navigation
                </h2>
                <Badge variant="success" className="text-xs">
                  ⚡ GOOGLE MAPS POLYLINE
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Route ID:{' '}
                <span className="font-mono text-foreground font-semibold">
                  {route?.collectorId || 'col-1'}
                </span>{' '}
                • {waypoints.length} Assigned Waypoints
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateGps}
              disabled={updateLocMutation.isPending}
              className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
            >
              <Compass className={`h-4 w-4 ${updateLocMutation.isPending ? 'animate-spin' : ''}`} />
              Simulate Fleet GPS Move (Step {simStep + 1})
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh Route
            </Button>
          </div>
        </div>

        {/* Route Metrics Bar */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-muted/40 border border-border/40 text-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
              <RouteIcon className="h-3.5 w-3.5 text-primary" /> Total Distance
            </span>
            <p className="text-xl font-heading font-black text-foreground mt-0.5">
              {route?.totalDistanceKm || 0} km
            </p>
          </div>
          <div className="border-x border-border/40">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" /> Est. Duration
            </span>
            <p className="text-xl font-heading font-black text-foreground mt-0.5">
              {route?.totalDurationMin || 0} min
            </p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Waypoint Stops
            </span>
            <p className="text-xl font-heading font-black text-foreground mt-0.5">
              {waypoints.length} stops
            </p>
          </div>
        </div>

        {/* Simulated Map / Polyline Canvas View */}
        <div className="relative h-56 rounded-2xl bg-slate-900/90 border border-border/40 overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner">
          {/* Simulated Polyline Background SVG */}
          <svg
            className="absolute inset-0 w-full h-full opacity-30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 50 150 Q 200 50 400 120 T 700 80 T 900 160"
              fill="none"
              stroke="#D7FF43"
              strokeWidth="4"
              strokeDasharray="8 8"
            />
          </svg>

          <div className="relative z-10 max-w-md space-y-2">
            <Badge
              variant="outline"
              className="bg-black/60 text-primary border-primary/40 text-[11px]"
            >
              Encoded Polyline: {route?.encodedPolyline?.slice(0, 24) || '_p~iF~ps|U_ulL...'}
            </Badge>
            <h4 className="font-heading text-base font-bold text-white">
              Turn-by-Turn GPS Fleet Navigation Active
            </h4>
            <p className="text-xs text-slate-300">
              Broadcasting GPS coordinates over WebSocket{' '}
              <code className="text-primary">/logistics</code> namespace for real-time customer
              tracking.
            </p>
          </div>
        </div>
      </Card>

      {/* Waypoint Stops Checklist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-foreground">
            Turn-by-Turn Waypoint Manifest
          </h3>
          <span className="text-xs font-semibold text-muted-foreground">
            Ordered by Nearest Euclidean Distance
          </span>
        </div>

        {waypoints.length === 0 ? (
          <EmptyState
            title="No Assigned Route Waypoints"
            description="You have not accepted any pickup jobs yet. Go to the Dashboard feed to accept nearby requests and generate your optimized polyline route."
            icon={<RouteIcon className="h-8 w-8 text-primary" />}
            actionLabel="Check Available Feed"
            onAction={() => {}}
          />
        ) : (
          <div className="space-y-4">
            {waypoints.map((stop: CollectorRouteWaypoint, idx: number) => {
              const isCompleted = stop.status === 'COMPLETED';
              const isArrived = stop.status === 'ARRIVED';

              return (
                <Card
                  key={stop.pickupId}
                  className={`p-5 transition-all duration-200 border-border/60 ${
                    isCompleted
                      ? 'bg-muted/30 opacity-75'
                      : isArrived
                        ? 'border-primary/60 bg-primary/5 shadow-md'
                        : 'bg-card'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-black text-sm shadow-sm ${
                          isCompleted
                            ? 'bg-green-500/20 text-green-600'
                            : isArrived
                              ? 'bg-primary text-primary-foreground glow-primary'
                              : 'bg-muted text-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          `#${stop.stopNumber || idx + 1}`
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isCompleted ? 'success' : isArrived ? 'warning' : 'secondary'}
                          >
                            {stop.status}
                          </Badge>
                          <span className="text-xs font-semibold text-muted-foreground">
                            Est. Load: {stop.estimatedWeightKg} kg
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-foreground text-base">
                          {stop.address.street}, {stop.address.city}, {stop.address.state}
                        </h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-primary" /> Customer:{' '}
                          {stop.customerName || 'Eco Household'} •{' '}
                          {stop.customerPhone || '+1 (555) 019-2831'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      {!isCompleted && !isArrived && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArrive(stop.pickupId)}
                          disabled={arriveMutation.isPending}
                          className="font-bold text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                        >
                          <Send className="h-3.5 w-3.5" /> Mark Arrived 📍
                        </Button>
                      )}

                      {isArrived && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            onOpenScanner({
                              id: stop.pickupId,
                              lat: stop.address.lat,
                              lng: stop.address.lng,
                              customerName: stop.customerName || 'Household Customer',
                              addressLabel: `${stop.address.street}, ${stop.address.city}`,
                              weight: stop.estimatedWeightKg,
                            })
                          }
                          className="glow-primary font-bold text-xs gap-1.5"
                        >
                          ⚡ Scan QR & Complete
                        </Button>
                      )}

                      {isCompleted && (
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-500/10">
                          <CheckCircle2 className="h-4 w-4" /> Verified & Paid
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
