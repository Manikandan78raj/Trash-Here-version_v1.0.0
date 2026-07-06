import React, { useState } from 'react';
import { XCircle, ShieldAlert, Check } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import { useCancelPickup } from '../../api/household.api';

export interface CancelPickupDialogProps {
  pickupId: string;
  status: string;
  onCancelled?: () => void;
}

const CANCELLATION_REASONS = [
  'Schedule changed / Need different date',
  'Found another recycling alternative',
  'Mistake in waste items / weight estimate',
  'Collector taking too long',
  'Other reason',
];

export const CancelPickupDialog: React.FC<CancelPickupDialogProps> = ({
  pickupId,
  status,
  onCancelled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customNote, setCustomNote] = useState('');

  const cancelMutation = useCancelPickup();

  // Can only cancel before collector arrives
  const canCancel = ['PENDING', 'ASSIGNED', 'COLLECTOR_ACCEPTED', 'EN_ROUTE', 'SCHEDULED'].includes(
    status,
  );

  if (!canCancel) return null;

  const handleConfirmCancel = () => {
    const finalReason =
      selectedReason === 'Other reason' && customNote.trim()
        ? `Other: ${customNote.trim()}`
        : selectedReason;

    cancelMutation.mutate(
      { id: pickupId, reason: finalReason },
      {
        onSuccess: () => {
          setIsOpen(false);
          if (onCancelled) onCancelled();
        },
      },
    );
  };

  return (
    <>
      <div className="flex justify-end mt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="text-xs font-mono text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <XCircle className="h-4 w-4 mr-1.5" />
          Cancel Pickup Request
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={(val) => !val && setIsOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Pickup Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this scheduled collection?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Free Cancellation Notice */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Free Cancellation Guaranteed
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed block mt-0.5 font-mono">
                  Because your collector has not yet arrived at your location, you can cancel this
                  request with zero fees or Eco Score penalties.
                </span>
              </div>
            </div>

            {/* Reasons Radio List */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-wider block">
                Please select a reason:
              </label>
              {CANCELLATION_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary/15 border-primary text-foreground font-bold shadow-sm ring-1 ring-primary'
                        : 'bg-card/50 border-border/60 text-muted-foreground hover:bg-card hover:text-foreground'
                    }`}
                  >
                    <span>{reason}</span>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Note Input if Other */}
            {selectedReason === 'Other reason' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-[11px] font-mono text-muted-foreground block">
                  Additional details (optional):
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Let us know how we can improve..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsOpen(false)}
                className="flex-1 font-mono text-xs font-bold rounded-xl"
              >
                Keep Pickup
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                disabled={cancelMutation.isPending}
                onClick={handleConfirmCancel}
                className="flex-1 font-mono text-xs font-bold rounded-xl bg-destructive/15 text-destructive hover:bg-destructive hover:text-white"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
