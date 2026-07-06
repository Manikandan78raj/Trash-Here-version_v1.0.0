import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Package,
  Calendar,
  Sparkles,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { usePickupById, useMyPickups, type PickupRequest } from '../api/household.api';
import {
  LiveStatusTimeline,
  CollectorInfoCard,
  LiveTelemetryMap,
  QRVerificationModal,
  CancelPickupDialog,
} from '../components/tracking';

export const LivePickupTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Monitor online / offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If ID is provided in URL, fetch that pickup. Otherwise fetch all user pickups to find latest active.
  const pickupByIdQuery = usePickupById(id);
  const allPickupsQuery = useMyPickups();

  // Determine which pickup to display
  let pickup: PickupRequest | undefined = id ? pickupByIdQuery.data : undefined;

  if (!id && allPickupsQuery.data && allPickupsQuery.data.length > 0) {
    // Find first non-completed/non-cancelled, or fallback to first one
    pickup =
      allPickupsQuery.data.find(
        (p: PickupRequest) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED',
      ) || allPickupsQuery.data[0];
  }

  const isLoading = id ? pickupByIdQuery.isLoading : allPickupsQuery.isLoading;
  const isError = id ? pickupByIdQuery.isError : allPickupsQuery.isError;
  const refetch = id ? pickupByIdQuery.refetch : allPickupsQuery.refetch;

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-12 w-12 mb-4 text-primary animate-spin mx-auto" />
        <h3 className="text-lg font-bold text-foreground">Connecting to Live Telemetry...</h3>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Establishing encrypted 5G GPS stream with dispatch server
        </p>
      </div>
    );
  }

  if (isError || !pickup) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="h-16 w-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mb-4 ring-2 ring-destructive/30">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-extrabold text-foreground">Pickup Tracking Unavailable</h3>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-mono">
          We could not locate an active dispatch stream for this ID. The pickup may have already
          been archived or the ID is invalid.
        </p>
        <div className="flex items-center gap-3 mt-6 w-full">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/app/dashboard')}
            className="flex-1 font-mono text-xs font-bold rounded-2xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => refetch()}
            className="flex-1 font-mono text-xs font-bold rounded-2xl"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Stream
          </Button>
        </div>
      </div>
    );
  }

  const address = pickup.address || {
    label: 'Home Address',
    street: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'IL',
  };

  const estimatedPayout = pickup.estimatedPayout || pickup.estimatedWeightKg * 0.45;
  const rewardPoints = pickup.rewardPoints || Math.round(pickup.estimatedWeightKg * 10);
  const qrSecret = pickup.qrCodeSecret || pickup.qrSecret || `TRASH-HERE-${pickup.id.slice(0, 8)}`;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20">
      {/* Offline Connection Alert Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-amber-500 text-black px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between font-mono text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 animate-bounce" />
              <span>OFFLINE MODE: Live GPS telemetry paused. Automatic reconnection active...</span>
            </div>
            <Badge variant="outline" className="border-black/30 text-black text-[10px]">
              RETRYING
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/dashboard')}
            className="h-10 w-10 p-0 rounded-2xl border-border/60 hover:bg-card shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Live Pickup Dispatch
              </h1>
              <Badge
                variant="outline"
                className="font-mono text-xs font-bold text-primary border-primary/40"
              >
                #{pickup.id.slice(0, 8)}
              </Badge>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Scheduled Date: {new Date(pickup.scheduledDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-mono text-xs px-3 py-1.5 rounded-xl">
            <ShieldCheck className="h-3.5 w-3.5 mr-1 text-primary" />
            SLA GUARANTEED
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="font-mono text-xs h-10 px-4 rounded-xl"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Sync Telemetry
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Column: Map, Timeline, Cancellation (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Live Telemetry Google Maps Platform Map */}
          <LiveTelemetryMap
            status={pickup.status}
            addressLabel={address.label}
            street={address.street}
            city={address.city}
          />

          {/* Live Status Timeline & Demo Simulator */}
          <LiveStatusTimeline
            pickupId={pickup.id}
            currentStatus={pickup.status}
            scheduledDate={pickup.scheduledDate}
          />

          {/* Cancellation Flow (Only visible before collector arrival) */}
          <CancelPickupDialog
            pickupId={pickup.id}
            status={pickup.status}
            onCancelled={() => refetch()}
          />
        </div>

        {/* Right / Sidebar Column: Collector Card, QR Pass, Manifest (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Collector Profile Card & Contact Actions */}
          <CollectorInfoCard collector={pickup.collector} status={pickup.status} />

          {/* Cryptographic QR Verification Modal / Pass */}
          <QRVerificationModal
            pickupId={pickup.id}
            qrSecret={qrSecret}
            estimatedWeightKg={pickup.estimatedWeightKg}
            rewardPoints={rewardPoints}
            estimatedPayout={estimatedPayout}
            status={pickup.status}
          />

          {/* Manifest Summary Card */}
          <Card className="p-6 border-border/60 bg-card/60 rounded-3xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-extrabold text-foreground tracking-tight">
                  Waste Manifest Summary
                </h4>
              </div>
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                {pickup.items?.length || 1} CATEGORIES
              </Badge>
            </div>

            <div className="space-y-3">
              {pickup.items && pickup.items.length > 0 ? (
                pickup.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between text-xs font-mono py-1.5 border-b border-border/20 last:border-0"
                  >
                    <span className="text-foreground font-medium">
                      {item.category?.name || `Waste Category #${idx + 1}`}
                    </span>
                    <span className="font-bold text-primary">~{item.estimatedWeightKg} kg</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between text-xs font-mono py-1">
                  <span className="text-foreground font-medium">Mixed Recyclable Waste</span>
                  <span className="font-bold text-primary">~{pickup.estimatedWeightKg} kg</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono bg-muted/20 p-3 rounded-2xl">
              <span className="text-muted-foreground">Estimated Total Value:</span>
              <span className="text-sm font-extrabold text-green-500">
                ${estimatedPayout.toFixed(2)} USD
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono px-3">
              <span className="text-muted-foreground">Green Points Reward:</span>
              <span className="font-bold text-primary flex items-center gap-1">
                <Sparkles className="h-3 w-3" />+{rewardPoints} Pts
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
