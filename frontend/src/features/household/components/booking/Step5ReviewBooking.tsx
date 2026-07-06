import React, { useMemo } from 'react';
import {
  Clock,
  MapPin,
  Award,
  Leaf,
  Sparkles,
  ArrowLeft,
  Send,
  Loader2,
  ShieldCheck,
  Recycle,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, Heading, Text, Button, Badge } from '@/components/ui';
import { type BookingFormValues } from './Step1CategorySelection';
import { type UserAddress } from '../../api/household.api';

interface Step5ReviewBookingProps {
  formValues: BookingFormValues;
  address?: UserAddress;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export const Step5ReviewBooking: React.FC<Step5ReviewBookingProps> = ({
  formValues,
  address,
  isSubmitting,
  onBack,
  onConfirm,
}) => {
  const { items, images, selectedDate, timeSlot, notes } = formValues;

  const totals = useMemo(() => {
    let weight = 0;
    let payout = 0;
    let points = 0;
    let co2 = 0;

    for (const item of items) {
      weight += item.estimatedWeightKg;
      payout += item.estimatedWeightKg * item.pricePerKg;
      points += item.estimatedWeightKg * item.pointsPerKg;
      co2 += item.estimatedWeightKg * item.co2SavedPerKg;
    }

    return {
      weight,
      payout: payout.toFixed(2),
      points: Math.round(points),
      co2: co2.toFixed(1),
    };
  }, [items]);

  const formattedDate = useMemo(() => {
    if (!selectedDate) return 'Not selected';
    const d = new Date(selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <Badge variant="default" size="sm" className="font-mono uppercase tracking-wider px-3 py-1">
          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
          Final Dispatch Audit
        </Badge>
        <Heading level={2} className="text-2xl md:text-3xl font-black">
          Review Your Pickup Manifest
        </Heading>
        <Text variant="muted" className="text-xs md:text-sm">
          Please verify your selected waste categories, address, and arrival window before our
          electric fleet is dispatched.
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Detailed Summary Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Selected Categories & Weights */}
          <Card className="p-6 rounded-3xl border border-border/80 bg-card/90 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <Heading level={3} className="text-base font-bold flex items-center gap-2">
                <Recycle className="h-5 w-5 text-primary" />
                Selected Waste Categories ({items.length})
              </Heading>
              <span className="text-xs font-mono font-bold text-primary">
                Total {totals.weight} kg
              </span>
            </div>

            <div className="divide-y divide-border/40">
              {items.map((it) => (
                <div key={it.categoryId} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <Heading level={4} className="text-sm font-bold">
                      {it.categoryName}
                    </Heading>
                    <Text variant="muted" className="text-xs font-mono">
                      ${it.pricePerKg.toFixed(2)}/kg • {it.pointsPerKg} pts/kg
                    </Text>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-foreground">
                      {it.estimatedWeightKg} kg
                    </div>
                    <div className="text-xs text-emerald-400 font-bold">
                      ${(it.estimatedWeightKg * it.pricePerKg).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 2. AI Verified Photos */}
          {images.length > 0 && (
            <Card className="p-6 rounded-3xl border border-border/80 bg-card/90 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <Heading level={3} className="text-base font-bold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-emerald-400" />
                  AI Verified Photos ({images.length})
                </Heading>
                <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                  <Sparkles className="mr-1 h-3 w-3 text-amber-400" />
                  Vision Verified
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative rounded-2xl overflow-hidden bg-muted h-28 border border-border/40"
                  >
                    <img
                      src={img.url}
                      alt="Verified waste"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-1.5 text-[9px] font-mono text-white text-center">
                      {Math.round(img.aiConfidence * 100)}% Match
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 3. Address & Time Slot */}
          <Card className="p-6 rounded-3xl border border-border/80 bg-card/90 space-y-4">
            <Heading
              level={3}
              className="text-base font-bold flex items-center gap-2 border-b border-border/40 pb-3"
            >
              <MapPin className="h-5 w-5 text-primary" />
              Dispatch Destination & Schedule
            </Heading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 bg-muted/40 p-4 rounded-2xl border border-border/40">
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Pickup Address
                </span>
                <Heading level={4} className="text-sm font-bold">
                  {address?.label || 'Selected Location'}
                </Heading>
                <Text variant="default" className="text-xs">
                  {address?.street || '742 Evergreen Terrace'}
                </Text>
                <Text variant="muted" className="text-xs font-mono">
                  {address?.city || 'San Francisco'}, {address?.state || 'CA'}{' '}
                  {address?.postalCode || address?.zipCode || '94110'}
                </Text>
              </div>

              <div className="space-y-1 bg-muted/40 p-4 rounded-2xl border border-border/40">
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Arrival Window
                </span>
                <Heading level={4} className="text-sm font-bold">
                  {formattedDate}
                </Heading>
                <Badge variant="default" size="sm" className="font-mono text-xs mt-1">
                  {timeSlot || '10:00 AM - 12:00 PM'}
                </Badge>
              </div>
            </div>

            {notes && (
              <div className="pt-2 border-t border-border/40">
                <span className="text-xs font-mono font-bold text-muted-foreground block mb-1">
                  Driver Instructions:
                </span>
                <Text
                  variant="muted"
                  className="text-xs italic bg-muted/30 p-3 rounded-xl border border-border/30"
                >
                  "{notes}"
                </Text>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Financial & Environmental Breakdown Card */}
        <div className="space-y-6">
          <Card className="p-6 rounded-3xl border-2 border-primary bg-card/95 shadow-xl space-y-6 sticky top-6">
            <div className="space-y-1 border-b border-border/40 pb-4">
              <Heading
                level={3}
                className="text-lg font-black font-heading flex items-center gap-2"
              >
                <Sparkles className="h-5 w-5 text-primary" />
                Dispatch Summary
              </Heading>
              <Text variant="muted" className="text-xs">
                Guaranteed minimum rates & carbon offset calculation
              </Text>
            </div>

            <div className="space-y-4 text-sm font-mono">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Estimated Weight</span>
                <span className="font-bold text-foreground">{totals.weight} kg</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Award className="h-4 w-4 text-amber-400" />
                  Green Reward Points
                </span>
                <span className="font-bold text-amber-400">+{totals.points} pts</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Leaf className="h-4 w-4 text-emerald-500" />
                  Carbon Offset Saved
                </span>
                <span className="font-bold text-emerald-500">+{totals.co2} kg CO₂</span>
              </div>

              <div className="pt-4 border-t border-border/60 flex justify-between items-center text-base">
                <span className="font-bold text-foreground">Estimated Payout</span>
                <span className="font-black text-xl text-primary font-mono">${totals.payout}</span>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 p-3.5 rounded-2xl text-xs font-mono text-foreground space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-primary">
                <ShieldCheck className="h-4 w-4" />
                100% Instant Stripe Payout
              </div>
              <div className="text-muted-foreground text-[11px]">
                Funds transfer directly to your wallet immediately upon collector QR scan at pickup.
              </div>
            </div>

            <Button
              onClick={onConfirm}
              disabled={isSubmitting}
              size="lg"
              className="w-full font-black text-sm tracking-wide py-6 rounded-2xl shadow-lg glow-primary group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Dispatching EV Fleet...
                </>
              ) : (
                <>
                  Confirm & Schedule Pickup
                  <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="pt-4 border-t border-border/40 flex items-center justify-between">
        <Button
          onClick={onBack}
          disabled={isSubmitting}
          variant="outline"
          size="lg"
          className="font-bold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Schedule
        </Button>
      </div>
    </div>
  );
};
