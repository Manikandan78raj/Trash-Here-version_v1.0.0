import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, ShieldCheck, Copy, Check, Sparkles, Scale, CheckCircle2 } from 'lucide-react';
import {
  Card,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import { useVerifyQrCode } from '../../api/household.api';

export interface QRVerificationModalProps {
  pickupId: string;
  qrSecret?: string;
  estimatedWeightKg: number;
  rewardPoints: number;
  estimatedPayout: number;
  status: string;
}

export const QRVerificationModal: React.FC<QRVerificationModalProps> = ({
  pickupId,
  qrSecret = 'ECO-SEC-9982-HASH',
  estimatedWeightKg,
  rewardPoints,
  estimatedPayout,
  status,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [simulatedWeight, setSimulatedWeight] = useState<number>(estimatedWeightKg);

  const verifyQrMutation = useVerifyQrCode();

  const isCompleted = status === 'COMPLETED';
  const isReadyForScan = ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(status);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(qrSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    verifyQrMutation.mutate(
      {
        qrCodeSecret: qrSecret,
        actualWeightKg: simulatedWeight,
      },
      {
        onSuccess: () => {
          // Keep modal open to show verification receipt
        },
      },
    );
  };

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 border-border/80 shadow-lg flex flex-col justify-between h-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  {isCompleted ? 'Verification Receipt' : 'QR Verification Pass'}
                </h3>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {isCompleted ? 'Cryptographically Verified' : 'Scan upon driver arrival'}
                </span>
              </div>
            </div>
            <Badge variant={isCompleted ? 'success' : isReadyForScan ? 'default' : 'secondary'}>
              {isCompleted ? 'Verified ✓' : isReadyForScan ? 'Active Pass' : 'Locked'}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed font-mono">
            {isCompleted
              ? 'This waste pickup was verified and logged to the eco-ledger. Rewards and carbon offsets have been deposited.'
              : 'When your driver arrives, show this secure QR pass or read out the 6-digit cryptographic PIN to verify collection.'}
          </p>
        </div>

        <div className="pt-4 border-t border-border/50 mt-4">
          <Button
            type="button"
            variant={isCompleted ? 'outline' : 'primary'}
            size="md"
            disabled={!isReadyForScan && !isCompleted}
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto font-mono text-xs font-extrabold rounded-2xl h-12 px-6 shadow-xl shadow-primary/20"
          >
            <QrCode className="h-4 w-4 mr-2" />
            {isCompleted ? 'View Receipt & Certificate' : 'Open QR Code Pass'}
          </Button>
        </div>
      </Card>

      {/* QR Verification & Receipt Modal */}
      <Dialog open={isModalOpen} onOpenChange={(val) => !val && setIsModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isCompleted ? 'Verification Receipt & Certificate' : 'Secure Pickup QR Code'}
            </DialogTitle>
            <DialogDescription>End-to-End Cryptographic Dispatch Verification</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 text-center my-4">
            <AnimatePresence mode="wait">
              {isCompleted || verifyQrMutation.isSuccess ? (
                <motion.div
                  key="success-receipt"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="h-20 w-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-4 ring-4 ring-green-500/30 animate-bounce">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-black text-foreground">Pickup Fully Verified!</h3>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    Reference ID: #{pickupId.slice(0, 12)}
                  </p>

                  {/* Rewards Breakdown Box */}
                  <div className="w-full mt-6 bg-muted/40 border border-border/60 rounded-2xl p-5 space-y-3 font-mono text-left">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Verified Actual Weight:</span>
                      <span className="font-bold text-foreground">{simulatedWeight} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Instant Cash Payout:</span>
                      <span className="font-bold text-green-500">
                        ${estimatedPayout.toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Green Points Awarded:</span>
                      <span className="font-bold text-primary">+{rewardPoints} Pts</span>
                    </div>
                    <div className="border-t border-border/50 pt-2 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">CO₂ Offset Contribution:</span>
                      <span className="font-bold text-emerald-400">
                        {(simulatedWeight * 3.5).toFixed(1)} kg CO₂
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-xs font-mono text-primary font-bold">
                    <Sparkles className="h-4 w-4" />
                    Rewards deposited directly into your Household Wallet!
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="qr-code-display"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full flex flex-col items-center"
                >
                  {/* Simulated High Contrast QR Code Box */}
                  <div className="p-6 bg-white rounded-3xl shadow-2xl border-4 border-primary/50 relative">
                    <div className="h-48 w-48 bg-[radial-gradient(#000000_2px,transparent_2px)] [background-size:12px_12px] flex items-center justify-center border-2 border-black rounded-xl">
                      <div className="bg-white p-3 rounded-2xl shadow-md border border-black/20 flex flex-col items-center">
                        <QrCode className="h-14 w-14 text-black" />
                        <span className="text-[9px] font-mono font-bold text-black mt-1">
                          TRASH-HERE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Secret Code Badge & Copy */}
                  <div className="mt-6 flex items-center gap-2 bg-muted/50 px-4 py-2.5 rounded-2xl border border-border/60 w-full justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm font-extrabold text-foreground tracking-widest">
                        {qrSecret}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopySecret}
                      className="h-8 px-2.5 rounded-xl text-xs font-mono"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>

                  {/* Driver Simulation Trigger Box */}
                  <div className="mt-6 w-full p-4 rounded-2xl bg-primary/10 border border-primary/30 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Scale className="h-3.5 w-3.5 text-primary" />
                        Driver Scale Telemetry
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">Demo Mode</span>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
                      In production, the driver scans this QR code and inputs the exact weight on
                      their scale. Test it below:
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        Actual Weight (kg):
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={simulatedWeight}
                        onChange={(e) => setSimulatedWeight(Number(e.target.value))}
                        className="w-20 h-8 rounded-lg border border-border/60 bg-background px-2 text-xs font-mono"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      disabled={verifyQrMutation.isPending}
                      onClick={handleSimulateScan}
                      className="w-full mt-4 font-mono text-xs font-bold rounded-xl h-10 px-4"
                    >
                      {verifyQrMutation.isPending ? 'Verifying...' : 'Simulate QR Scan ✓'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
