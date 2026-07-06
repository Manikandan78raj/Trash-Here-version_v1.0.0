import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Camera,
  CheckCircle2,
  Recycle,
  Shield,
  Copy,
  Check,
  Phone,
  Mail,
  Award,
  Leaf,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/common/notifications/toast';
import { useProfile, useUpdateProfile, useUploadAvatar } from '../api/hub.api';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  bio: z.string().max(250, 'Bio cannot exceed 250 characters').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileTab: React.FC = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Split fullName into firstName and lastName
  const getNames = (fullName?: string) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (profile) {
      const { firstName, lastName } = getNames(profile.fullName);
      reset({
        firstName,
        lastName,
        phone: profile.phone || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate({
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      bio: values.bio,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file format. Please select JPEG, PNG, or WEBP.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Maximum allowed is 5MB.');
      return;
    }

    uploadAvatarMutation.mutate(file);
  };

  const copyReferral = () => {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode);
    setCopiedReferral(true);
    toast.success('Referral code copied to clipboard!');
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm font-bold text-muted-foreground">Loading profile data...</p>
      </div>
    );
  }

  // Calculate ESG Tree planting milestone (e.g. 50kg per tree)
  const treesPlanted = Math.floor((profile.carbonSavedKg || 0) / 50);
  const nextTreeKg = (treesPlanted + 1) * 50;
  const progressPercent = Math.min(
    100,
    Math.round(((profile.carbonSavedKg || 0) / nextTreeKg) * 100),
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cover Image Banner & Avatar Header */}
      <Card className="relative overflow-hidden border-border/60 bg-card shadow-lg">
        {/* Cover Gradient Banner */}
        <div className="h-44 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-lime-400 relative">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge className="bg-background/80 text-foreground backdrop-blur-md border border-border/40 px-3 py-1 font-extrabold shadow-sm">
              <Shield className="h-3.5 w-3.5 mr-1 text-primary" />
              {profile.role?.name || 'ENTERPRISE PRO'}
            </Badge>
            {profile.isVerified && (
              <Badge className="bg-primary text-primary-foreground px-3 py-1 font-extrabold shadow-sm glow-primary">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Verified Member
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Avatar & Info Row */}
        <div className="px-6 pb-6 pt-0 flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
            {/* Avatar with upload trigger */}
            <div className="relative group">
              <div className="h-32 w-32 rounded-3xl border-4 border-background bg-primary/20 shadow-xl overflow-hidden flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-14 w-14 text-primary" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatarMutation.isPending}
                className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg hover:scale-105 transition-transform"
                title="Change Avatar"
              >
                {uploadAvatarMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Names & Bio */}
            <div className="space-y-1 mb-1">
              <h2 className="font-heading text-2xl font-black text-foreground tracking-tight flex items-center justify-center md:justify-start gap-2">
                {profile.fullName}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-3.5 w-3.5" />
                {profile.email}
              </p>
              {profile.bio && (
                <p className="text-xs text-foreground/80 max-w-lg mt-1 italic">"{profile.bio}"</p>
              )}
            </div>
          </div>

          {/* Referral Code Copy Box */}
          <div className="flex items-center gap-2 rounded-2xl bg-muted/60 border border-border/40 p-3 self-center md:self-end">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Referral Code
              </span>
              <span className="text-sm font-mono font-black text-foreground">
                {profile.referralCode || 'TRASH-2026'}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyReferral}
              className="h-9 w-9 rounded-xl border-border/60 hover:bg-background"
              title="Copy Referral Code"
            >
              {copiedReferral ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Eco Metrics & ESG Impact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-border/60 bg-card/80 backdrop-blur-md shadow-md space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Eco Score Rating
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-4xl font-black text-foreground">
              {profile.ecoScore || 850}
            </span>
            <span className="text-xs font-bold text-emerald-500">+12% this month</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Top 5% of environmentally conscious enterprise households.
          </p>
        </Card>

        <Card className="p-6 border-border/60 bg-card/80 backdrop-blur-md shadow-md space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Carbon Saved
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500">
              <Leaf className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-4xl font-black text-foreground">
              {profile.carbonSavedKg || 124.5}
            </span>
            <span className="text-sm font-bold text-muted-foreground">kg CO₂</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
              <span>Next Tree Milestone ({nextTreeKg} kg)</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/60 bg-card/80 backdrop-blur-md shadow-md space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Account Status
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-500">
              <Recycle className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Member Since:</span>
              <span className="text-xs font-extrabold text-foreground">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Jan 2026'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Email Verified:</span>
              <span className="text-xs font-extrabold text-emerald-500 flex items-center gap-1">
                <Check className="h-3 w-3" /> Yes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Wallet Balance:</span>
              <span className="text-xs font-extrabold text-foreground">
                ${profile.wallet?.balance?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Profile Form */}
      <Card className="p-6 border-border/60 bg-card shadow-lg space-y-6">
        <div className="border-b border-border/40 pb-4">
          <h3 className="font-heading text-lg font-extrabold text-foreground">
            Personal Information
          </h3>
          <p className="text-xs text-muted-foreground">
            Update your enterprise contact details and bio visible to assigned waste collectors.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                First Name
              </label>
              <Input
                {...register('firstName')}
                placeholder="Enter first name"
                className="rounded-2xl"
              />
              {errors.firstName && (
                <p className="text-xs font-bold text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Last Name
              </label>
              <Input
                {...register('lastName')}
                placeholder="Enter last name"
                className="rounded-2xl"
              />
              {errors.lastName && (
                <p className="text-xs font-bold text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('phone')}
                  placeholder="+1 (555) 000-0000"
                  className="pl-10 rounded-2xl"
                />
              </div>
              {errors.phone && (
                <p className="text-xs font-bold text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Email Address (Read Only)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={profile.email}
                  disabled
                  className="pl-10 rounded-2xl bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Bio / Special Pickup Instructions
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              placeholder="E.g., Gate code is #4829. Please ring bell upon arrival."
              className="w-full rounded-2xl border border-border/60 bg-background p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            {errors.bio && (
              <p className="text-xs font-bold text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-border/40">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending || !isDirty}
              className="rounded-2xl px-6 font-extrabold shadow-md glow-primary"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                'Save Profile Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
