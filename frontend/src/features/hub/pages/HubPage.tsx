import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sliders, Shield, Database, Sparkles } from 'lucide-react';
import { ProfileTab } from '../components/ProfileTab';
import { SettingsTab } from '../components/SettingsTab';
import { SecurityTab } from '../components/SecurityTab';
import { GdprTab } from '../components/GdprTab';

const TABS = [
  { id: 'profile', label: 'Profile & Eco Metrics', icon: <User className="h-4 w-4" /> },
  { id: 'settings', label: 'Preferences & Theme', icon: <Sliders className="h-4 w-4" /> },
  { id: 'security', label: 'Security & Password', icon: <Shield className="h-4 w-4" /> },
  { id: 'gdpr', label: 'Data & Privacy (GDPR)', icon: <Database className="h-4 w-4" /> },
];

export const HubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sprint 6 • Enterprise Hub
            </span>
          </div>
          <h1 className="font-heading text-3xl font-black text-foreground tracking-tight">
            Account & System Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your enterprise identity, real-time notification channels, security policies, and
            GDPR data portability.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-3">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-all duration-200 ${
                isActive
                  ? 'bg-foreground text-background shadow-md'
                  : 'bg-card/60 border border-border/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                {tab.icon}
              </span>
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="hub-tab-indicator"
                  className="absolute -bottom-3.5 left-0 right-0 h-1 rounded-full bg-primary glow-primary"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area with Smooth Animation */}
      <div className="pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'gdpr' && <GdprTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
