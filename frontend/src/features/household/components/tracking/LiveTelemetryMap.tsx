import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, AlertTriangle, Compass, Radio, Zap } from 'lucide-react';
import { Card, Badge } from '@/components/ui';

export interface LiveTelemetryMapProps {
  status: string;
  addressLabel?: string;
  street?: string;
  city?: string;
}

export const LiveTelemetryMap: React.FC<LiveTelemetryMapProps> = ({
  status,
  addressLabel = 'Home Address',
  street = '742 Evergreen Terrace',
  city = 'Springfield',
}) => {
  // Simulate live driver movement along a polyline
  const [progressPercent, setProgressPercent] = useState<number>(25);
  const [remainingKm, setRemainingKm] = useState<number>(4.2);
  const [etaMinutes, setEtaMinutes] = useState<number>(12);

  useEffect(() => {
    if (status === 'COMPLETED' || status === 'CANCELLED' || status === 'PENDING') return;

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 90) return 90; // Stop near arrival until verified
        const next = prev + 3;
        const remaining = Math.max(0.2, Number((4.2 * (1 - next / 100)).toFixed(1)));
        const eta = Math.max(1, Math.round(12 * (1 - next / 100)));
        setRemainingKm(remaining);
        setEtaMinutes(eta);
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [status]);

  const isCompleted = status === 'COMPLETED';
  const isCancelled = status === 'CANCELLED';
  const isPending = status === 'PENDING';

  return (
    <Card className="p-0 border-border/60 bg-card/80 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden relative">
      {/* Top Telemetry & ETA Engine Overlay Bar */}
      <div className="p-6 bg-gradient-to-r from-card via-card/95 to-card/90 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center ring-2 ring-primary/40 shadow-inner">
            <Navigation className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-foreground tracking-tight">
                Live GPS Telemetry &amp; ETA Engine
              </h3>
              <Badge variant="default" size="sm" className="font-mono text-[10px]">
                <Radio className="h-3 w-3 mr-1 animate-ping text-primary" />
                5G TELEMETRY
              </Badge>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Destination: {addressLabel} • {street}, {city}
            </p>
          </div>
        </div>

        {/* ETA Metrics Breakdown */}
        <div className="flex items-center gap-4 bg-muted/30 px-4 py-3 rounded-2xl border border-border/50">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              Estimated Arrival
            </span>
            <span className="text-lg font-extrabold text-primary font-mono tracking-tight flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {isCompleted
                ? 'Arrived & Verified'
                : isCancelled
                  ? 'Cancelled'
                  : isPending
                    ? 'Calculating...'
                    : `${etaMinutes} Mins`}
            </span>
          </div>

          <div className="h-8 w-px bg-border/60" />

          <div className="text-center sm:text-left">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              Distance Left
            </span>
            <span className="text-lg font-extrabold text-foreground font-mono tracking-tight">
              {isCompleted || isCancelled ? '0.0 km' : `${remainingKm} km`}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Google Maps Platform Styled Polyline Map View */}
      <div className="relative h-80 w-full bg-[#111318] overflow-hidden flex items-center justify-center">
        {/* Background Map Grid & Roads Simulation */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#D7FF43_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Simulated Road Arteries */}
        <div className="absolute inset-x-0 top-1/3 h-12 bg-neutral-900/80 border-y border-neutral-800 flex items-center justify-between px-12 transform -rotate-6 scale-110">
          <div className="w-full border-t-2 border-dashed border-neutral-700" />
        </div>
        <div className="absolute inset-y-0 left-1/3 w-16 bg-neutral-900/80 border-x border-neutral-800 flex flex-col justify-between py-12 transform rotate-12 scale-110">
          <div className="h-full border-l-2 border-dashed border-neutral-700 mx-auto" />
        </div>

        {/* Route Polyline SVG */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none z-10"
          viewBox="0 0 800 320"
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#D7FF43" stopOpacity="1" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Polyline shadow/glow */}
          <path
            d="M 100 240 Q 280 180 420 160 T 700 80"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#glow)"
            className="animate-pulse"
          />

          {/* Dashed polyline center */}
          <path
            d="M 100 240 Q 280 180 420 160 T 700 80"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="8 6"
            strokeLinecap="round"
          />
        </svg>

        {/* Start Pin: Recycling Depot Hub */}
        <div className="absolute left-[12%] bottom-[22%] z-20 flex flex-col items-center">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg ring-4 ring-blue-500/30 font-mono text-[10px] font-bold flex items-center gap-1 mb-1">
            <Compass className="h-3.5 w-3.5" />
            Depot Hub #4
          </div>
          <div className="h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-500/30" />
        </div>

        {/* Moving Driver EV Van Pin along route */}
        {!isCancelled && !isCompleted && (
          <motion.div
            className="absolute z-30 flex flex-col items-center"
            style={{
              left: `${12 + progressPercent * 0.75}%`,
              bottom: `${22 + progressPercent * 0.52}%`,
            }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-2xl shadow-2xl font-mono text-xs font-extrabold flex items-center gap-1.5 ring-4 ring-primary/40 animate-bounce">
              <Zap className="h-3.5 w-3.5 fill-current" />
              EV Van En Route
            </div>
            <div className="h-5 w-5 rounded-full bg-primary ring-4 ring-primary/50 shadow-lg mt-1" />
          </motion.div>
        )}

        {/* Destination Pin: Household User Address */}
        <div className="absolute right-[12%] top-[20%] z-20 flex flex-col items-center">
          <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-2xl shadow-xl ring-4 ring-emerald-500/30 font-mono text-xs font-extrabold flex items-center gap-1 mb-1 animate-pulse">
            <MapPin className="h-3.5 w-3.5 fill-current" />
            {addressLabel} (Destination)
          </div>
          <div className="h-6 w-6 rounded-full bg-emerald-500 ring-4 ring-emerald-500/40 flex items-center justify-center text-white font-bold text-[10px]">
            ★
          </div>
        </div>

        {/* Bottom Left Traffic Delay Overlay Badge */}
        <div className="absolute bottom-4 left-4 z-30 bg-background/90 backdrop-blur-md border border-border/60 rounded-2xl p-3 shadow-xl max-w-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-foreground block">
                Live Traffic Telemetry
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight block mt-0.5 font-mono">
                Minor delay (+2 mins) on Route 104 due to city roadworks. SLA guaranteed.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Right Google Maps Platform Badge */}
        <div className="absolute bottom-4 right-4 z-30 bg-black/80 px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono text-white/80 tracking-wider flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
          GOOGLE MAPS PLATFORM • LIVE SDK
        </div>
      </div>
    </Card>
  );
};
