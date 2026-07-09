import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Phone, KeyRound, ArrowRight, ArrowLeft, Smartphone, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { useAuth } from '@/common/auth/useAuth';
import { authApi } from '@/common/auth/auth.api';
import { toast } from '@/common/notifications/toast';
import { Card, Input, Button } from '@/components/ui';

export const VerifyOtpPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isAuthenticated && !authLoading) {
    return <Navigate to="/app" replace />;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMessage('Please enter your mobile phone number.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await authApi.sendOtp({ phone: phone.trim() });
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      } else {
        setDevOtp('123456');
      }
      setStep('otp');
      toast.success('SMS OTP Dispatched', res.message || `Verification code sent to ${phone.trim()}.`);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to dispatch SMS verification code.');
      toast.error('OTP Dispatch Error', err?.response?.data?.message || 'Please verify your phone number.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await authApi.verifyOtp({ phone: phone.trim(), otp: otp.trim() });
      if (res.accessToken && res.user) {
        login(res.accessToken, res.user);
        toast.success(`Welcome, ${res.user.fullName}!`, 'Mobile verification successful.');
        navigate('/app', { replace: true });
      } else {
        throw new Error('Invalid OTP response payload.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid verification code. Please try again or use 123456 in dev.';
      setErrorMessage(msg);
      toast.error('Verification Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyDevOtp = () => {
    const code = devOtp || '123456';
    setOtp(code);
    setIsCopied(true);
    toast.info('Code Autofilled', `Dev OTP ${code} inserted into verification field.`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card glass className="p-8 md:p-10 border-slate-800/80 bg-slate-900/80 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D7FF43] to-transparent opacity-80" />

      {step === 'phone' ? (
        <>
          <div className="text-center space-y-2 mb-8">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#D7FF43]/15 border border-[#D7FF43]/30 flex items-center justify-center text-[#D7FF43] mb-4">
              <Smartphone className="h-6 w-6 stroke-[2.2]" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">SMS OTP Verification</h2>
            <p className="text-sm text-slate-400">
              Enter your mobile number to receive a one-time login passcode
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-start gap-3 text-destructive text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1 block">
                Mobile Phone Number <span className="text-destructive">*</span>
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 0101"
                required
                leftIcon={<Phone className="h-4 w-4" />}
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-[#D7FF43]"
                disabled={isSubmitting || authLoading}
              />
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting || authLoading}
              className="w-full h-12 bg-[#D7FF43] hover:bg-[#c4eb3a] text-slate-950 font-bold rounded-2xl shadow-lg shadow-[#D7FF43]/20 transition-all text-base"
              rightIcon={!isSubmitting ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              Send SMS Passcode
            </Button>
          </form>
        </>
      ) : (
        <div className="animate-in fade-in slide-in-from-right duration-300">
          <div className="text-center space-y-2 mb-6">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#D7FF43]/15 border border-[#D7FF43]/30 flex items-center justify-center text-[#D7FF43] mb-4">
              <KeyRound className="h-6 w-6 stroke-[2.2]" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Enter Passcode</h2>
            <p className="text-sm text-slate-400">
              6-digit passcode sent via SMS to <span className="text-white font-semibold">{phone}</span>
            </p>
          </div>

          {devOtp && (
            <div
              onClick={handleCopyDevOtp}
              className="mb-6 p-3.5 rounded-2xl bg-[#D7FF43]/10 border border-[#D7FF43]/30 flex items-center justify-between text-xs text-slate-200 cursor-pointer hover:bg-[#D7FF43]/20 transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#D7FF43]">💡 Dev Mode Passcode:</span>
                <span className="font-mono text-sm tracking-widest font-bold text-white bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                  {devOtp}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#D7FF43] font-semibold text-xs group-hover:scale-105 transition-transform">
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Autofilled</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Click to Autofill</span>
                  </>
                )}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-start gap-3 text-destructive text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1 block">
                Verification Code <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                leftIcon={<KeyRound className="h-4 w-4" />}
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-[#D7FF43] font-mono tracking-[0.3em] text-center text-lg font-bold"
                disabled={isSubmitting || authLoading}
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting || authLoading}
                className="w-full h-12 bg-[#D7FF43] hover:bg-[#c4eb3a] text-slate-950 font-bold rounded-2xl shadow-lg shadow-[#D7FF43]/20 transition-all text-base"
                leftIcon={!isSubmitting ? <CheckCircle2 className="h-4 w-4" /> : undefined}
              >
                Verify Passcode & Login
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setErrorMessage(null);
                }}
                className="w-full h-10 text-xs text-slate-400 hover:text-white"
              >
                Change Phone Number ({phone})
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="text-center pt-6 text-sm text-slate-400 border-t border-slate-800/80 mt-8">
        Prefer traditional email login?{' '}
        <Link to="/login" className="text-[#D7FF43] font-semibold hover:underline inline-flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </Card>
  );
};
