import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Smartphone, AlertCircle } from 'lucide-react';
import { useAuth } from '@/common/auth/useAuth';
import { authApi } from '@/common/auth/auth.api';
import { toast } from '@/common/notifications/toast';
import { Card, Input, Button } from '@/components/ui';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Requirement 5: Redirect authenticated users away from /login to /app (or originally requested destination)
  if (isAuthenticated && !authLoading) {
    const fromPath = (location.state as any)?.from?.pathname || '/app';
    return <Navigate to={fromPath} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await authApi.login({ email: email.trim(), password });
      if (res.accessToken && res.user) {
        login(res.accessToken, res.user);
        toast.success(`Welcome back, ${res.user.fullName}!`, 'You have successfully logged in.');
        const fromPath = (location.state as any)?.from?.pathname || '/app';
        navigate(fromPath, { replace: true });
      } else {
        throw new Error('Invalid authentication payload received.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid email or password. Please verify your credentials.';
      setErrorMessage(msg);
      toast.error('Login Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card glass className="p-8 md:p-10 border-slate-800/80 bg-slate-900/80 shadow-2xl relative overflow-hidden">
      {/* Decorative top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D7FF43] to-transparent opacity-80" />

      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h2>
        <p className="text-sm text-slate-400">
          Sign in to access your Trash Here Enterprise portal & rewards
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
            Email Address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@enterprise.com"
            required
            leftIcon={<Mail className="h-4 w-4" />}
            className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-[#D7FF43]"
            disabled={isSubmitting || authLoading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-[#D7FF43] hover:underline font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
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

        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || authLoading}
            className="w-full h-12 bg-[#D7FF43] hover:bg-[#c4eb3a] text-slate-950 font-bold rounded-2xl shadow-lg shadow-[#D7FF43]/20 transition-all text-base"
            leftIcon={!isSubmitting ? <LogIn className="h-4 w-4" /> : undefined}
          >
            Sign In to Enterprise
          </Button>
        </div>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800/80" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-3 text-slate-400 font-semibold tracking-wider">
            Alternative Access
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <Link to="/verify-otp" className="block w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80 text-slate-200 rounded-2xl transition-all"
            leftIcon={<Smartphone className="h-4 w-4 text-[#D7FF43]" />}
          >
            Sign in with SMS OTP Verification
          </Button>
        </Link>

        <div className="text-center pt-2 text-sm text-slate-400">
          Don&apos;t have an enterprise or household account?{' '}
          <Link to="/register" className="text-[#D7FF43] font-semibold hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </Card>
  );
};
