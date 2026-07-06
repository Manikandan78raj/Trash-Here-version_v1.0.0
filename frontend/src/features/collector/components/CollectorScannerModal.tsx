import React, { useState, useMemo } from 'react';
import {
  QrCode,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Scale,
  DollarSign,
  Camera,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useCompletePickupJob } from '../api/collector.api';

interface CollectorScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickupId: string | null;
  expectedLat?: number;
  expectedLng?: number;
  customerName?: string;
  addressLabel?: string;
  estimatedWeightKg?: number;
}

// Helper to calculate Haversine distance in meters for live UI preview
function calculateHaversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const CollectorScannerModal: React.FC<CollectorScannerModalProps> = ({
  isOpen,
  onClose,
  pickupId,
  expectedLat = 37.7749,
  expectedLng = -122.4194,
  customerName = 'Household Customer',
  addressLabel = '123 Green St, SF',
  estimatedWeightKg = 5.0,
}) => {
  const [simulatedLat, setSimulatedLat] = useState<number>(expectedLat);
  const [simulatedLng, setSimulatedLng] = useState<number>(expectedLng);
  const [qrSecret, setQrSecret] = useState<string>('secret-token-123');
  const [actualWeightKg, setActualWeightKg] = useState<number>(estimatedWeightKg);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const completeJobMutation = useCompletePickupJob();

  // Calculate live distance from household bin
  const distanceMeters = useMemo(() => {
    return calculateHaversineMeters(simulatedLat, simulatedLng, expectedLat, expectedLng);
  }, [simulatedLat, simulatedLng, expectedLat, expectedLng]);

  const isWithinGeofence = distanceMeters <= 100;
  const estimatedPayout = (actualWeightKg * 2.5).toFixed(2);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setQrSecret('secret-token-123');
      setIsScanning(false);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupId) return;

    completeJobMutation.mutate(
      {
        pickupId,
        dto: {
          lat: Number(simulatedLat),
          lng: Number(simulatedLng),
          qrSecret,
          actualWeightKg: Number(actualWeightKg),
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-sm glow-primary">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Geofence QR Code Verification</DialogTitle>
              <DialogDescription>
                Verify bin token and confirm GPS proximity within 100m for {customerName}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Household Stop Details */}
          <Card className="p-4 bg-muted/40 border-border/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Target Pickup Stop
              </span>
              <p className="font-semibold text-foreground">{addressLabel}</p>
              <p className="text-xs text-muted-foreground">
                Expected: {estimatedWeightKg} kg recyclable waste
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              ID: {pickupId?.slice(0, 8) || 'N/A'}
            </Badge>
          </Card>

          {/* Haversine Geofence Proximity Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                Live GPS Geofence Proximity (Max 100m)
              </label>
              {isWithinGeofence ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {distanceMeters}m Away — Within Geofence
                </Badge>
              ) : (
                <Badge variant="error" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {distanceMeters}m Away — Outside Geofence
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Current Latitude
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={simulatedLat}
                  onChange={(e) => setSimulatedLat(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Current Longitude
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={simulatedLng}
                  onChange={(e) => setSimulatedLng(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs flex-1"
                onClick={() => {
                  setSimulatedLat(expectedLat);
                  setSimulatedLng(expectedLng);
                }}
              >
                📍 Match Bin GPS (0m)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs flex-1 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setSimulatedLat(expectedLat + 0.005); // ~500m away
                }}
              >
                ⚠️ Simulate 500m Away
              </Button>
            </div>
          </div>

          {/* QR Code Scanner Simulation */}
          <div className="space-y-3 pt-2 border-t border-border/40">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-primary" />
              Bin Cryptographic Token (QR Scan)
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={qrSecret}
                onChange={(e) => setQrSecret(e.target.value)}
                placeholder="Scan QR or enter secret token..."
                className="font-mono text-sm flex-1"
                required
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="shrink-0"
              >
                {isScanning ? 'Scanning...' : '📷 Simulate Scan'}
              </Button>
            </div>
          </div>

          {/* Actual Weight & Payout Preview */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-primary" />
                Actual Weight (kg)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="500"
                value={actualWeightKg}
                onChange={(e) => setActualWeightKg(parseFloat(e.target.value) || 0)}
                className="mt-1 text-lg font-bold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-primary" />
                Instant Payout Credit
              </label>
              <div className="mt-1 h-11 px-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between font-bold text-primary text-lg glow-primary">
                <span>Stripe Cash:</span>
                <span>${estimatedPayout}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={completeJobMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isWithinGeofence || !qrSecret || completeJobMutation.isPending}
              className="glow-primary font-bold px-6"
            >
              {completeJobMutation.isPending ? 'Verifying...' : '⚡ Verify & Complete Pickup'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
