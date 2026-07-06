import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  QrCode,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Card, Heading, Text, Button, Badge } from '@/components/ui';
import { type BookingFormValues } from './Step1CategorySelection';

interface Step6ConfirmationProps {
  bookingResult: any;
  formValues: BookingFormValues;
  onReset: () => void;
  onViewTracking: () => void;
}

export const Step6Confirmation: React.FC<Step6ConfirmationProps> = ({
  bookingResult,
  formValues,
  onReset,
  onViewTracking,
}) => {
  const pickupId = bookingResult?.id ? bookingResult.id.slice(0, 8).toUpperCase() : 'PK-8492-PRO';
  const qrSecret = bookingResult?.qrSecret || 'QR-ENT-VERIFY-992';

  const totalWeight = formValues.items.reduce((acc, it) => acc + it.estimatedWeightKg, 0);
  const totalPayout = formValues.items
    .reduce((acc, it) => acc + it.estimatedWeightKg * it.pricePerKg, 0)
    .toFixed(2);
  const totalPoints = Math.round(
    formValues.items.reduce((acc, it) => acc + it.estimatedWeightKg * it.pointsPerKg, 0),
  );

  return (
    <div className="max-w-2xl mx-auto py-8 text-center space-y-8 animate-in fade-in duration-500">
      {/* 1. Success Animation Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mx-auto w-24 h-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center text-primary shadow-2xl glow-primary"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl pointer-events-none"
        />
        <CheckCircle2 className="h-12 w-12 text-primary fill-primary/20" />
      </motion.div>

      {/* 2. Header & Manifest ID */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          EV Fleet Dispatched & Confirmed
        </div>

        <Heading level={2} className="text-3xl md:text-4xl font-black font-heading tracking-tight">
          Pickup Manifest #{pickupId}
        </Heading>

        <Text variant="muted" className="text-sm max-w-md mx-auto">
          Your waste pickup request is confirmed! An electric collector vehicle has been assigned
          and scheduled for arrival.
        </Text>
      </div>

      {/* 3. Summary Card */}
      <Card className="p-6 md:p-8 rounded-3xl border-2 border-primary/40 bg-card/90 text-left space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
              Status
            </span>
            <div className="flex items-center gap-2 text-foreground font-bold text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              Scheduled • Collector EV Assigned
            </div>
          </div>

          <Badge
            variant="default"
            size="sm"
            className="font-mono text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <QrCode className="h-3.5 w-3.5" />
            Code: {qrSecret}
          </Badge>
        </div>

        {/* Schedule & Weight Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
          <div className="bg-muted/40 p-3.5 rounded-2xl border border-border/40">
            <span className="text-[11px] font-mono font-bold text-muted-foreground block mb-0.5">
              Weight
            </span>
            <span className="font-mono font-black text-foreground text-sm">{totalWeight} kg</span>
          </div>

          <div className="bg-muted/40 p-3.5 rounded-2xl border border-border/40">
            <span className="text-[11px] font-mono font-bold text-muted-foreground block mb-0.5">
              Est. Payout
            </span>
            <span className="font-mono font-black text-primary text-sm">${totalPayout}</span>
          </div>

          <div className="bg-muted/40 p-3.5 rounded-2xl border border-border/40">
            <span className="text-[11px] font-mono font-bold text-muted-foreground block mb-0.5">
              Rewards
            </span>
            <span className="font-mono font-black text-amber-400 text-sm">+{totalPoints} pts</span>
          </div>

          <div className="bg-muted/40 p-3.5 rounded-2xl border border-border/40">
            <span className="text-[11px] font-mono font-bold text-muted-foreground block mb-0.5">
              Window
            </span>
            <span className="font-mono font-black text-foreground text-xs truncate block">
              {formValues.timeSlot || '10:00 - 12:00 PM'}
            </span>
          </div>
        </div>

        {/* Next Steps Banner */}
        <div className="bg-primary/10 border border-primary/30 p-4 rounded-2xl flex items-start gap-3 text-xs font-mono text-foreground">
          <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-primary">What happens next?</div>
            <div className="text-muted-foreground leading-relaxed">
              When the collector arrives, show them your QR code or manifest ID. Upon scan, actual
              weight is verified and funds are instantly deposited to your Stripe wallet!
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button
          onClick={onViewTracking}
          size="lg"
          className="w-full sm:w-auto font-black text-sm tracking-wide px-8 py-6 rounded-2xl shadow-lg glow-primary group"
        >
          <Truck className="mr-2 h-5 w-5" />
          View Active Queue & Tracking
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto font-bold px-6 py-6 rounded-2xl"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Schedule Another Pickup
        </Button>
      </div>
    </div>
  );
};
