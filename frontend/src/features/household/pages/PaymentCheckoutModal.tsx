import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Heading,
  Text,
  Button,
  Input,
  Card,
  Badge,
} from '@/components/ui';
import { useValidateCoupon, useProcessCheckout } from '../api/wallet.api';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  pickupRequestId?: string;
  onSuccess?: () => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  initialAmount = 25.0,
  pickupRequestId,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState<number>(initialAmount);
  const [validatedCode, setValidatedCode] = useState<string | null>(null);

  const validateCouponMutation = useValidateCoupon();
  const checkoutMutation = useProcessCheckout();

  useEffect(() => {
    setAmount(initialAmount);
    setFinalAmount(initialAmount);
    setDiscountAmount(0);
    setValidatedCode(null);
  }, [initialAmount, isOpen]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    validateCouponMutation.mutate(
      { code: couponCode, orderAmount: amount },
      {
        onSuccess: (data) => {
          setDiscountAmount(data.discountAmount);
          setFinalAmount(data.finalAmount);
          setValidatedCode(data.code);
        },
      },
    );
  };

  const handlePayNow = () => {
    checkoutMutation.mutate(
      {
        amount,
        currency: 'USD',
        pickupRequestId,
        couponCode: validatedCode || undefined,
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md rounded-[30px] backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 shadow-2xl border border-white/20">
        <DialogHeader>
          <DialogTitle>Secure Eco Checkout</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-2">
          <div className="text-center space-y-1">
            <Badge
              variant="success"
              className="bg-[rgb(215,255,67)] text-black font-semibold px-3 py-1 rounded-full"
            >
              Stripe Simulated Checkout
            </Badge>
            <Heading level={4} className="mt-2">
              {pickupRequestId ? 'On-Demand Waste Pickup' : 'Account Top-Up'}
            </Heading>
            <Text variant="muted">Instant settlement & carbon offset tracking</Text>
          </div>

          <Card className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 space-y-3 border-none">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
              <span className="font-medium">${amount.toFixed(2)}</span>
            </div>
            {validatedCode && (
              <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Promo ({validatedCode})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 flex justify-between items-center font-bold text-lg">
              <span>Total Due</span>
              <span className="text-xl text-black dark:text-white">${finalAmount.toFixed(2)}</span>
            </div>
          </Card>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Have a Promo Code?
            </label>
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. ECO-SUMMER-20"
                className="rounded-xl flex-1 uppercase font-mono"
                disabled={!!validatedCode || validateCouponMutation.isPending}
              />
              <Button
                variant={validatedCode ? 'outline' : 'secondary'}
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || !!validatedCode || validateCouponMutation.isPending}
                className="rounded-xl px-4 font-semibold"
              >
                {validateCouponMutation.isPending ? '...' : validatedCode ? 'Applied' : 'Apply'}
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              onClick={handlePayNow}
              disabled={checkoutMutation.isPending}
              className="w-full py-4 rounded-2xl bg-[rgb(215,255,67)] hover:bg-[rgb(195,235,47)] text-black font-bold text-base shadow-lg shadow-[rgb(215,255,67)]/20 transition-all transform active:scale-[0.98]"
            >
              {checkoutMutation.isPending ? 'Processing...' : `Pay $${finalAmount.toFixed(2)} Now`}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full py-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
