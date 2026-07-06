import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Recycle,
  Camera,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  WifiOff,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Heading, Button, Badge } from '@/components/ui';
import { toast } from '@/common/notifications/toast';
import {
  useCreatePickup,
  useAddresses,
  type CreatePickupDto,
  type CreatePickupItemDto,
} from '../api/household.api';

// Step Components
import {
  Step1CategorySelection,
  type BookingFormValues,
} from '../components/booking/Step1CategorySelection';
import { Step2ImageUpload } from '../components/booking/Step2ImageUpload';
import { Step3PickupAddress } from '../components/booking/Step3PickupAddress';
import { Step4ScheduleTime } from '../components/booking/Step4ScheduleTime';
import { Step5ReviewBooking } from '../components/booking/Step5ReviewBooking';
import { Step6Confirmation } from '../components/booking/Step6Confirmation';

// ==========================================
// 1. Zod Validation Schema
// ==========================================
const bookingSchema = z.object({
  items: z
    .array(
      z.object({
        categoryId: z.string().min(1),
        categoryName: z.string(),
        pricePerKg: z.number(),
        pointsPerKg: z.number(),
        co2SavedPerKg: z.number(),
        estimatedWeightKg: z.number().min(1),
      }),
    )
    .min(1, 'Please select at least one waste category'),
  images: z.array(z.any()),
  addressId: z.string().min(1, 'Please select a valid pickup address'),
  selectedDate: z.string().min(1, 'Please select a pickup date'),
  timeSlot: z.string().min(1, 'Please select an arrival window'),
  notes: z.string().optional(),
});

export const PickupBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const { data: addresses } = useAddresses();
  const createPickupMutation = useCreatePickup();

  // Network offline detector
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

  // Initialize React Hook Form
  const { control, handleSubmit, watch, setValue, reset } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      items: [],
      images: [],
      addressId: '',
      selectedDate: '',
      timeSlot: '10:00 AM - 12:00 PM',
      notes: '',
    },
  });

  const formValues = watch();

  const stepTitles = [
    { num: 1, label: 'Categories', icon: <Recycle className="h-4 w-4" /> },
    { num: 2, label: 'AI Photos', icon: <Camera className="h-4 w-4" /> },
    { num: 3, label: 'Address', icon: <MapPin className="h-4 w-4" /> },
    { num: 4, label: 'Schedule', icon: <Calendar className="h-4 w-4" /> },
    { num: 5, label: 'Review', icon: <ShieldCheck className="h-4 w-4" /> },
    { num: 6, label: 'Confirmed', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  // Submit Handler for Step 5 -> Step 6
  const onSubmit = async (data: BookingFormValues) => {
    if (isOffline) {
      toast.error(
        'You are currently offline. Please check your internet connection before dispatching.',
      );
      return;
    }

    const itemsDto: CreatePickupItemDto[] = data.items.map((it, idx) => {
      const matchedImg = data.images[idx] || data.images[0];
      return {
        categoryId: it.categoryId,
        estimatedWeightKg: it.estimatedWeightKg,
        photoUrl:
          matchedImg?.url ||
          'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80',
        aiConfidence: matchedImg?.aiConfidence || 0.96,
      };
    });

    const payload: CreatePickupDto = {
      addressId: data.addressId,
      scheduledDate: new Date(data.selectedDate + 'T10:00:00Z').toISOString(),
      items: itemsDto,
      notes: data.notes || undefined,
    };

    try {
      const res = await createPickupMutation.mutateAsync(payload);
      setBookingResult(res);
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      // Error is handled in hook onError, keep user on review step
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && formValues.items.length === 0) {
      toast.error('Please select at least one waste category to proceed.');
      return;
    }
    if (currentStep === 3 && !formValues.addressId) {
      toast.error('Please select or create a pickup address to proceed.');
      return;
    }
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetFlow = () => {
    reset();
    setBookingResult(null);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewTracking = () => {
    toast.info('Redirecting to Household Dashboard & Active Queue...');
    navigate('/app');
  };

  const selectedAddressObject = addresses?.find((a) => a.id === formValues.addressId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Offline Warning Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-500 flex items-center justify-between gap-4 shadow-md"
          >
            <div className="flex items-center gap-3">
              <WifiOff className="h-6 w-6 flex-shrink-0 animate-pulse" />
              <div className="text-xs font-mono">
                <strong className="block font-bold">Offline Mode Detected</strong>
                You can browse categories and draft your manifest, but internet connection is
                required to dispatch collector vehicles.
              </div>
            </div>
            <Badge variant="secondary" className="font-mono text-[10px]">
              Offline
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app')}
              className="px-2 h-8 text-xs font-mono text-muted-foreground hover:text-foreground mr-1"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Dashboard
            </Button>
            <Badge
              variant="default"
              size="sm"
              className="font-mono text-[10px] uppercase tracking-wider"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Milestone 3.2
            </Badge>
          </div>
          <Heading
            level={1}
            className="text-2xl md:text-3xl font-black font-heading tracking-tight"
          >
            Schedule Electric Waste Pickup
          </Heading>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span>Step {currentStep} of 6</span>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Progress Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
        {stepTitles.map((st) => {
          const isCompleted = currentStep > st.num;
          const isCurrent = currentStep === st.num;
          const isClickable = st.num < currentStep;

          return (
            <button
              key={st.num}
              type="button"
              disabled={!isClickable && !isCurrent}
              onClick={() => {
                if (isClickable) {
                  setCurrentStep(st.num);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 relative overflow-hidden ${
                isCurrent
                  ? 'border-primary bg-primary/15 shadow-md glow-primary/20 font-bold'
                  : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 cursor-pointer hover:bg-emerald-500/20'
                    : 'border-border/40 bg-card/40 text-muted-foreground opacity-60 cursor-not-allowed'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold border ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground border-primary'
                    : isCompleted
                      ? 'bg-emerald-500 text-black border-emerald-500'
                      : 'bg-muted border-border/60'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : st.icon}
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono block uppercase opacity-80">
                  Step 0{st.num}
                </span>
                <span className="text-xs font-bold font-heading truncate block text-foreground">
                  {st.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Wizard Content Area */}
      <div className="min-h-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step 1: Waste Categories */}
            {currentStep === 1 && (
              <Controller
                name="items"
                control={control}
                render={({ field }) => (
                  <Step1CategorySelection
                    selectedItems={field.value}
                    onChange={field.onChange}
                    onNext={handleNextStep}
                  />
                )}
              />
            )}

            {/* Step 2: AI Photo Upload */}
            {currentStep === 2 && (
              <Controller
                name="images"
                control={control}
                render={({ field }) => (
                  <Step2ImageUpload
                    images={field.value}
                    onChange={field.onChange}
                    onBack={handlePrevStep}
                    onNext={handleNextStep}
                  />
                )}
              />
            )}

            {/* Step 3: Pickup Address */}
            {currentStep === 3 && (
              <Controller
                name="addressId"
                control={control}
                render={({ field }) => (
                  <Step3PickupAddress
                    selectedAddressId={field.value}
                    onChange={field.onChange}
                    onBack={handlePrevStep}
                    onNext={handleNextStep}
                  />
                )}
              />
            )}

            {/* Step 4: Schedule Date & Time Slot */}
            {currentStep === 4 && (
              <Step4ScheduleTime
                selectedDate={formValues.selectedDate}
                timeSlot={formValues.timeSlot}
                notes={formValues.notes || ''}
                onChange={(field, val) => setValue(field, val)}
                selectedItems={formValues.items}
                onBack={handlePrevStep}
                onNext={handleNextStep}
              />
            )}

            {/* Step 5: Review Manifest */}
            {currentStep === 5 && (
              <Step5ReviewBooking
                formValues={formValues}
                address={selectedAddressObject}
                isSubmitting={createPickupMutation.isPending}
                onBack={handlePrevStep}
                onConfirm={handleSubmit(onSubmit)}
              />
            )}

            {/* Step 6: Confirmed & Dispatched */}
            {currentStep === 6 && (
              <Step6Confirmation
                bookingResult={bookingResult}
                formValues={formValues}
                onReset={handleResetFlow}
                onViewTracking={handleViewTracking}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PickupBookingPage;
