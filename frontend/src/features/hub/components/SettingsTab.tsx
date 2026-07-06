import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Bell,
  Eye,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  AlertTriangle,
  Check,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/common/theme/useTheme';
import { toast } from '@/common/notifications/toast';
import { useSettings, useUpdateSettings, type UserSettingsData } from '../api/hub.api';

export const SettingsTab: React.FC = () => {
  const { setTheme } = useTheme();
  const { data: settings, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  const handleToggle = (key: keyof UserSettingsData, currentValue?: boolean) => {
    if (!settings) return;
    updateSettingsMutation.mutate({ [key]: !currentValue });
  };

  const handleThemeChange = (newTheme: 'LIGHT' | 'DARK' | 'SYSTEM') => {
    const themeMap: Record<string, 'light' | 'dark' | 'system'> = {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system',
    };
    setTheme(themeMap[newTheme] || 'system');
    updateSettingsMutation.mutate({ theme: newTheme });
  };

  const handleLanguageChange = (lang: string) => {
    updateSettingsMutation.mutate({ language: lang });
  };

  if (isLoading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm font-bold text-muted-foreground">Loading settings & preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Theme & Display */}
      <Card className="p-6 border-border/60 bg-card shadow-lg space-y-6">
        <div className="border-b border-border/40 pb-4">
          <h3 className="font-heading text-lg font-extrabold text-foreground flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" /> Appearance & Theme
          </h3>
          <p className="text-xs text-muted-foreground">
            Customize the visual aesthetic of your enterprise dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'LIGHT',
              label: 'Light Mode',
              icon: <Sun className="h-5 w-5 text-amber-500" />,
              desc: 'Clean, high contrast white aesthetic',
            },
            {
              id: 'DARK',
              label: 'Dark Mode',
              icon: <Moon className="h-5 w-5 text-primary" />,
              desc: 'Sleek, deep black & lime green accents',
            },
            {
              id: 'SYSTEM',
              label: 'System Sync',
              icon: <Laptop className="h-5 w-5 text-blue-500" />,
              desc: 'Matches operating system preferences',
            },
          ].map((item) => {
            const isSelected = settings.theme === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleThemeChange(item.id as any)}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-md glow-primary'
                    : 'border-border/40 bg-muted/20 hover:border-border hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background border border-border/40">
                    {item.icon}
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{item.label}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Language Selection */}
        <div className="pt-4 border-t border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Interface Language
            </h4>
            <p className="text-xs text-muted-foreground">
              Select your preferred language for reports, invoices, and alerts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { code: 'en', label: 'English (US)' },
              { code: 'es', label: 'Español' },
              { code: 'fr', label: 'Français' },
              { code: 'de', label: 'Deutsch' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  settings.language === lang.code
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 2. Notification Preferences */}
      <Card className="p-6 border-border/60 bg-card shadow-lg space-y-6">
        <div className="border-b border-border/40 pb-4">
          <h3 className="font-heading text-lg font-extrabold text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Notification Channels & Alerts
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage how and when Trash Here notifies you of pickup updates, rewards, and security
            events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Channels */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Delivery Channels
            </h4>
            {[
              {
                key: 'emailNotifications' as const,
                label: 'Email Notifications',
                icon: <Mail className="h-4 w-4 text-blue-500" />,
                desc: 'Receive summary reports and receipts via email',
              },
              {
                key: 'smsNotifications' as const,
                label: 'SMS Text Messages',
                icon: <MessageSquare className="h-4 w-4 text-emerald-500" />,
                desc: 'Real-time driver arrival & SMS verification',
              },
              {
                key: 'pushNotifications' as const,
                label: 'Push Notifications',
                icon: <Smartphone className="h-4 w-4 text-purple-500" />,
                desc: 'Browser and mobile app push alerts',
              },
            ].map((channel) => (
              <div
                key={channel.key}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background border border-border/40">
                    {channel.icon}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">{channel.label}</h5>
                    <p className="text-[10px] text-muted-foreground">{channel.desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(channel.key, settings[channel.key])}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings[channel.key] ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                      settings[channel.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Alert Types */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Alert Types
            </h4>
            {[
              {
                key: 'pickupAlerts' as const,
                label: 'Pickup & GPS Tracking',
                desc: 'Driver assigned, en route, and completion alerts',
              },
              {
                key: 'rewardAlerts' as const,
                label: 'Rewards & Vouchers',
                desc: 'Green points earned, tier promotions, and store deals',
              },
              {
                key: 'securityAlerts' as const,
                label: 'Security & Logins',
                desc: 'New device logins, password changes, and 2FA alerts',
              },
              {
                key: 'marketingAlerts' as const,
                label: 'Eco Insights & Promos',
                desc: 'Monthly carbon impact reports and exclusive offers',
              },
            ].map((alert) => (
              <div
                key={alert.key}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-muted/20"
              >
                <div>
                  <h5 className="text-xs font-bold text-foreground">{alert.label}</h5>
                  <p className="text-[10px] text-muted-foreground">{alert.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(alert.key, settings[alert.key])}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings[alert.key] ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                      settings[alert.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 3. Privacy & Telemetry */}
      <Card className="p-6 border-border/60 bg-card shadow-lg space-y-6">
        <div className="border-b border-border/40 pb-4">
          <h3 className="font-heading text-lg font-extrabold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" /> Privacy & Telemetry
          </h3>
          <p className="text-xs text-muted-foreground">
            Control your profile visibility on the community leaderboard and data sharing
            preferences.
          </p>
        </div>

        <div className="space-y-4">
          {/* Profile Visibility */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-border/40 bg-muted/20">
            <div>
              <h4 className="text-sm font-bold text-foreground">Profile Visibility</h4>
              <p className="text-xs text-muted-foreground">
                Choose who can view your eco score and carbon savings on the public ESG leaderboard.
              </p>
            </div>
            <div className="flex gap-1.5">
              {(['PUBLIC', 'FRIENDS', 'PRIVATE'] as const).map((vis) => (
                <button
                  key={vis}
                  onClick={() => updateSettingsMutation.mutate({ profileVisibility: vis })}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    settings.profileVisibility === vis
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-background border border-border/40 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {vis === 'PUBLIC' ? 'Public' : vis === 'FRIENDS' ? 'Partners Only' : 'Private'}
                </button>
              ))}
            </div>
          </div>

          {/* Location Sharing */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/20">
            <div>
              <h4 className="text-sm font-bold text-foreground">Real-Time Location Sharing</h4>
              <p className="text-xs text-muted-foreground">
                Allow assigned waste collectors to see your precise GPS coordinates when approaching
                for pickup.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('locationSharing', settings.locationSharing)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.locationSharing ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  settings.locationSharing ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Data Collection */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/20">
            <div>
              <h4 className="text-sm font-bold text-foreground">AI Telemetry Consent</h4>
              <p className="text-xs text-muted-foreground">
                Allow Trash Here to use anonymized waste weight data to train route optimization
                models.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('dataCollectionConsent', settings.dataCollectionConsent)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.dataCollectionConsent ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  settings.dataCollectionConsent ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* 4. Danger Zone */}
      <Card className="p-6 border-destructive/40 bg-destructive/5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-extrabold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently deactivate your account, erase wallet balance, and forfeit accumulated
              green points.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setIsDeactivateOpen(true)}
            className="rounded-2xl font-bold"
          >
            Deactivate Account
          </Button>
        </div>

        {isDeactivateOpen && (
          <div className="p-4 rounded-2xl bg-card border border-destructive/60 space-y-3 animate-fade-in">
            <h4 className="text-sm font-bold text-foreground">Are you absolutely sure?</h4>
            <p className="text-xs text-muted-foreground">
              This action cannot be undone. All pending pickups will be canceled and non-withdrawn
              wallet funds will be returned to the corporate escrow treasury.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeactivateOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  toast.error(
                    'Account deactivation requested. Please check your email to confirm.',
                  );
                  setIsDeactivateOpen(false);
                }}
                className="rounded-xl text-xs font-extrabold"
              >
                Yes, Delete My Account
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
