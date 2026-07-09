import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, UserPlus, AlertCircle, Home, Truck, Recycle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/common/auth/useAuth';
import { authApi } from '@/common/auth/auth.api';
import { toast } from '@/common/notifications/toast';
import { Card, Input, Button, cn } from '@/components/ui';

type RegisterRole = 'USER' | 'COLLECTOR' | 'RECYCLER';

const ROLE_OPTIONS: Array<{
  id: RegisterRole;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'USER',
    label: 'Household / Office',
    description: 'Schedule pickups, earn Green Points & redeem eco-vouchers.',
    icon: <Home className="h-5 w-5" />,
  },
  {
    id: 'COLLECTOR',
    label: 'Logistics Collector',
    description: 'Accept dispatch orders, navigate routes & receive instant payouts.',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    id: 'RECYCLER',
    label: 'Commercial Recycler',
    description: 'Weighbridge intake, lot processing & automated ESG manifests.',
    icon: <Recycle className="h-5 w-5" />,
  },
];

export const RegisterPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RegisterRole>('USER');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Requirement 5: Redirect authenticated users away from /register to /app
  if (isAuthenticated && !authLoading) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
        password,
      });

      if (res.accessToken && res.user) {
        login(res.accessToken, res.user);
        toast.success(
          `Welcome to Trash Here, ${res.user.fullName}!`,
          'Your account is active. +500 Green Points welcome bonus awarded.',
        );

        const targetRoute =
          role === 'COLLECTOR' ? '/collector' : role === 'RECYCLER' ? '/recycler' : '/app';
        navigate(targetRoute, { replace: true });
      } else {
        throw new Error('Invalid registration payload received.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Account creation failed. This email or phone may already be registered.';
      setErrorMessage(msg);
      toast.error('Registration Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card glass className="p-8 md:p-10 border-slate-800/80 bg-slate-900/80 shadow-2xl relative overflow-hidden">
      {/* Decorative top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D7FF43] to-transparent opacity-80" />

      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-white">Create Account</h2>
        <p className="text-sm text-slate-400">
          Join the zero-waste circular economy with +500 Green Points bonus
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-start gap-3 text-destructive text-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1 block">
            Select Account Role
          </label>
          <div className="grid grid-cols-1 gap-3">
            {ROLE_OPTIONS.map((option) => {
              const isSelected = role === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRole(option.id)}
                  disabled={isSubmitting || authLoading}
                  className={cn(
                    'flex items-center text-left p-3.5 rounded-2xl border transition-all duration-200 relative group',
                    isSelected
                      ? 'bg-[#D7FF43]/15 border-[#D7FF43] text-white shadow-md'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-950/80',
                  )}
                >
                  <div
                    className={cn(
                      'p-2.5 rounded-xl mr-3.5 transition-colors',
                      isSelected
                        ? 'bg-[#D7FF43] text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 group-hover:text-slate-200',
                    )}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      {option.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 leading-snug truncate sm:whitespace-normal sm:overflow-visible sm:text-clip">
                      {option.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute right-4 text-[#D7FF43]">
                      <CheckCircle2 className="h-5 w-5 fill-[#D7FF43] text-slate-950" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1 block">
              Full Legal Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Morgan"
              required
              leftIcon={<User className="h-4 w-4" />}
              className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-[#D7FF43]"
              disabled={isSubmitting || authLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1 block">
              Mobile Phone <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 0199"
              leftIcon={<Phone className="h-4 w-4" />}
              className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-[#D7FF43]"
              disabled={isSubmitting || authLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1 block">
            Email Address <span className="text-destructive">*</span>
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.morgan@enterprise.com"
            required
            leftIcon={<Mail className="h-4 w-4" />}
            className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-[#D7FF43]"
            disabled={isSubmitting || authLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1 block">
            Create Password <span className="text-destructive">*</span>
          </label>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-[#D7FF43]"
            disabled={isSubmitting || authLoading}
          />
        </div>

        <div className="pt-3">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || authLoading}
            className="w-full h-12 bg-[#D7FF43] hover:bg-[#c4eb3a] text-slate-950 font-bold rounded-2xl shadow-lg shadow-[#D7FF43]/20 transition-all text-base"
            leftIcon={!isSubmitting ? <UserPlus className="h-4 w-4" /> : undefined}
          >
            Register & Claim +500 Points
          </Button>
        </div>
      </form>

      <div className="text-center pt-6 text-sm text-slate-400 border-t border-slate-800/80 mt-6">
        Already registered with Trash Here?{' '}
        <Link to="/login" className="text-[#D7FF43] font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </Card>
  );
};
