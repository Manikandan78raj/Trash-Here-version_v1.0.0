import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  FileText,
  DollarSign,
  Award,
  Leaf,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Card, Heading, Text, Button, Badge } from '@/components/ui';
import { type BookingItemState } from './Step1CategorySelection';

interface Step4ScheduleTimeProps {
  selectedDate: string;
  timeSlot: string;
  notes: string;
  onChange: (field: 'selectedDate' | 'timeSlot' | 'notes', value: string) => void;
  selectedItems: BookingItemState[];
  onBack: () => void;
  onNext: () => void;
}

export const Step4ScheduleTime: React.FC<Step4ScheduleTimeProps> = ({
  selectedDate,
  timeSlot,
  notes,
  onChange,
  selectedItems,
  onBack,
  onNext,
}) => {
  // Generate next 14 days for scheduling
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isToday = i === 0;
      const isTomorrow = i === 1;
      dates.push({
        iso,
        weekday: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : weekday,
        monthDay,
      });
    }
    return dates;
  }, []);

  const timeSlots = useMemo(
    () => [
      { label: '08:00 AM - 10:00 AM', tag: 'Morning Express', available: true },
      { label: '10:00 AM - 12:00 PM', tag: 'Standard Peak', available: true },
      { label: '01:00 PM - 03:00 PM', tag: 'Afternoon Eco', available: true },
      { label: '03:00 PM - 05:00 PM', tag: 'High Availability', available: true },
      { label: '05:00 PM - 07:00 PM', tag: 'Evening Slot', available: true },
    ],
    [],
  );

  // Set defaults if empty
  React.useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      onChange('selectedDate', availableDates[0].iso);
    }
    if (!timeSlot && timeSlots.length > 0) {
      onChange('timeSlot', timeSlots[1].label);
    }
  }, [selectedDate, timeSlot, availableDates, timeSlots, onChange]);

  // Live Calculations
  const totals = useMemo(() => {
    let weight = 0;
    let payout = 0;
    let points = 0;
    let co2 = 0;

    for (const item of selectedItems) {
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
  }, [selectedItems]);

  return (
    <div className="space-y-8">
      {/* 1. Live Value Calculator Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-emerald-500/10 border-2 border-primary/40 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" size="sm" className="font-mono text-[10px] uppercase">
                <Sparkles className="mr-1 h-3 w-3" />
                Live Pricing Engine
              </Badge>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                Total Weight: <strong className="text-foreground">{totals.weight} kg</strong>
              </span>
            </div>
            <Heading
              level={3}
              className="text-xl md:text-2xl font-black font-heading tracking-tight"
            >
              Estimated Value & Environmental Impact
            </Heading>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-border/40">
            <div className="bg-background/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-border/60 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-xs font-mono mb-0.5">
                <DollarSign className="h-3.5 w-3.5" />
                Est. Payout
              </div>
              <div className="text-lg md:text-xl font-black font-mono text-foreground">
                ${totals.payout}
              </div>
            </div>

            <div className="bg-background/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-border/60 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-xs font-mono mb-0.5">
                <Award className="h-3.5 w-3.5" />
                Rewards
              </div>
              <div className="text-lg md:text-xl font-black font-mono text-foreground">
                {totals.points} <span className="text-xs font-normal">pts</span>
              </div>
            </div>

            <div className="bg-background/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-border/60 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-emerald-500 font-bold text-xs font-mono mb-0.5">
                <Leaf className="h-3.5 w-3.5" />
                CO₂ Saved
              </div>
              <div className="text-lg md:text-xl font-black font-mono text-foreground">
                {totals.co2} <span className="text-xs font-normal">kg</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Date Selection (Next 14 Days) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading level={3} className="text-base font-bold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Select Pickup Date
          </Heading>
          <Text variant="muted" className="text-xs font-mono">
            Next 14 days dispatch schedule
          </Text>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {availableDates.map((item) => {
            const isSelected = item.iso === selectedDate;
            return (
              <motion.button
                key={item.iso}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onChange('selectedDate', item.iso)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg glow-primary/30 font-bold'
                    : 'bg-card/80 border-border/60 hover:border-primary/50 text-foreground'
                }`}
              >
                <span
                  className={`text-[11px] font-mono uppercase ${
                    isSelected ? 'text-primary-foreground/90 font-black' : 'text-muted-foreground'
                  }`}
                >
                  {item.weekday}
                </span>
                <span className="text-sm font-bold font-heading">{item.monthDay}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 3. Time Slot Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading level={3} className="text-base font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Select Arrival Window
          </Heading>
          <Text variant="muted" className="text-xs font-mono">
            2-hour electric vehicle window
          </Text>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeSlots.map((slot) => {
            const isSelected = slot.label === timeSlot;
            return (
              <Card
                key={slot.label}
                onClick={() => onChange('timeSlot', slot.label)}
                className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-md glow-primary/20 font-bold'
                    : 'border-border/60 bg-card/80 hover:border-primary/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-foreground">
                      {slot.label}
                    </span>
                  </div>
                  <Badge
                    variant={isSelected ? 'default' : 'secondary'}
                    size="sm"
                    className="text-[10px] font-mono"
                  >
                    {slot.tag}
                  </Badge>
                </div>

                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border/60 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. Pickup Instructions Textarea */}
      <div className="space-y-3">
        <label className="text-sm font-bold font-heading flex items-center gap-2 text-foreground">
          <FileText className="h-4 w-4 text-primary" />
          Driver Instructions & Access Notes (Optional)
        </label>
        <Text variant="muted" className="text-xs">
          Help our collector vehicle locate your waste items smoothly (e.g., gate code, apartment
          buzzer, leave by driveway).
        </Text>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="e.g., Gate code is #4829. Boxes are stacked neatly inside the side wooden fence..."
          className="w-full p-4 rounded-2xl bg-card/80 border border-border/80 text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Footer Action Bar */}
      <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button onClick={onBack} variant="outline" size="lg" className="w-full sm:w-auto font-bold">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Address
        </Button>

        <Button
          onClick={onNext}
          disabled={!selectedDate || !timeSlot}
          size="lg"
          className="w-full sm:w-auto font-bold tracking-wide group"
        >
          Proceed to Review
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
