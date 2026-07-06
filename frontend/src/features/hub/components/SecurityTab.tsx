import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  KeyRound,
  Mail,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useChangePassword, useUpdateEmail } from '../api/hub.api';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const emailSchema = z.object({
  newEmail: z.string().email('Please enter a valid enterprise email address'),
  password: z.string().min(1, 'Current password is required to change email'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export const SecurityTab: React.FC = () => {
  const changePasswordMutation = useChangePassword();
  const updateEmailMutation = useUpdateEmail();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register: regPass,
    handleSubmit: handlePassSubmit,
    watch: watchPass,
    reset: resetPass,
    formState: { errors: passErrors, isDirty: isPassDirty },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    register: regEmail,
    handleSubmit: handleEmailSubmit,
    reset: resetEmail,
    formState: { errors: emailErrors, isDirty: isEmailDirty },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      newEmail: '',
      password: '',
    },
  });

  const newPasswordVal = watchPass('newPassword') || '';

  // Password Strength Calculations
  const checks = {
    length: newPasswordVal.length >= 8,
    uppercase: /[A-Z]/.test(newPasswordVal),
    lowercase: /[a-z]/.test(newPasswordVal),
    number: /[0-9]/.test(newPasswordVal),
    special: /[^A-Za-z0-9]/.test(newPasswordVal),
  };

  const passedCount = Object.values(checks).filter(Boolean).length;
  const strengthPercent = (passedCount / 5) * 100;

  const getStrengthColor = () => {
    if (passedCount <= 2) return 'bg-destructive';
    if (passedCount <= 4) return 'bg-amber-500';
    return 'bg-primary glow-primary';
  };

  const getStrengthLabel = () => {
    if (passedCount === 0) return 'Not Started';
    if (passedCount <= 2) return 'Weak';
    if (passedCount <= 4) return 'Moderate';
    return 'Strong & Secure';
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    if (passedCount < 5) {
      return;
    }
    changePasswordMutation.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => resetPass(),
      },
    );
  };

  const onEmailSubmit = (values: EmailFormValues) => {
    updateEmailMutation.mutate(
      { newEmail: values.newEmail, password: values.password },
      {
        onSuccess: () => resetEmail(),
      },
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Change Password & Strength Meter */}
      <Card className="p-6 border-border/60 bg-card shadow-lg space-y-6">
        <div className="border-b border-border/40 pb-4">
          <h3 className="font-heading text-lg font-extrabold text-foreground flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" /> Password Management
          </h3>
          <p className="text-xs text-muted-foreground">
            Update your account credentials. We enforce NIST-compliant enterprise password
            complexity rules.
          </p>
        </div>

        <form onSubmit={handlePassSubmit(onPasswordSubmit)} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2 max-w-md">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                {...regPass('currentPassword')}
                placeholder="••••••••••••"
                className="pr-10 rounded-2xl"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passErrors.currentPassword && (
              <p className="text-xs font-bold text-destructive">
                {passErrors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New & Confirm Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  {...regPass('newPassword')}
                  placeholder="Enter new password"
                  className="pr-10 rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passErrors.newPassword && (
                <p className="text-xs font-bold text-destructive">
                  {passErrors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  {...regPass('confirmPassword')}
                  placeholder="Repeat new password"
                  className="pr-10 rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passErrors.confirmPassword && (
                <p className="text-xs font-bold text-destructive">
                  {passErrors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Live Password Strength Meter */}
          <div className="p-4 rounded-2xl border border-border/40 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Password Strength</span>
              <span className="text-xs font-extrabold text-foreground">{getStrengthLabel()}</span>
            </div>

            {/* Animated Bar */}
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getStrengthColor()}`}
                style={{ width: `${strengthPercent}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {[
                { label: 'At least 8 characters', passed: checks.length },
                { label: 'One uppercase letter', passed: checks.uppercase },
                { label: 'One lowercase letter', passed: checks.lowercase },
                { label: 'One number', passed: checks.number },
                { label: 'One special character', passed: checks.special },
              ].map((chk, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {chk.passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                  )}
                  <span
                    className={chk.passed ? 'font-bold text-foreground' : 'text-muted-foreground'}
                  >
                    {chk.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border/40">
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending || !isPassDirty || passedCount < 5}
              className="rounded-2xl px-6 font-extrabold shadow-md glow-primary"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Update Email Address */}
      <Card className="p-6 border-border/60 bg-card shadow-lg space-y-6">
        <div className="border-b border-border/40 pb-4">
          <h3 className="font-heading text-lg font-extrabold text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Update Enterprise Email
          </h3>
          <p className="text-xs text-muted-foreground">
            Changing your primary email address requires password re-authentication and triggers a
            verification email.
          </p>
        </div>

        <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                New Email Address
              </label>
              <Input
                type="email"
                {...regEmail('newEmail')}
                placeholder="new.email@company.com"
                className="rounded-2xl"
              />
              {emailErrors.newEmail && (
                <p className="text-xs font-bold text-destructive">{emailErrors.newEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Current Password for Verification
              </label>
              <Input
                type="password"
                {...regEmail('password')}
                placeholder="••••••••••••"
                className="rounded-2xl"
              />
              {emailErrors.password && (
                <p className="text-xs font-bold text-destructive">{emailErrors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border/40">
            <Button
              type="submit"
              disabled={updateEmailMutation.isPending || !isEmailDirty}
              className="rounded-2xl px-6 font-extrabold"
            >
              {updateEmailMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : (
                'Change Email Address'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Multi-Factor & Security Auditing */}
      <Card className="p-6 border-border/60 bg-card/80 backdrop-blur-md shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-heading text-md font-extrabold text-foreground">
              Enterprise Security Shield Active
            </h4>
            <p className="text-xs text-muted-foreground">
              Your account is monitored by 24/7 automated anomaly detection and JWT session
              fingerprinting.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
