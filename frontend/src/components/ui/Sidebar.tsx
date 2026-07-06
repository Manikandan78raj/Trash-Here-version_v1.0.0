import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Home,
  Recycle,
  ShieldAlert,
  Calendar,
  Navigation,
  Wallet,
  Gift,
  Crown,
  Bell,
  Sliders,
} from 'lucide-react';
import { cn } from './Typography';

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, children }) => {
  return (
    <aside
      className={cn(
        'relative z-30 flex flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl transition-all duration-300',
        isOpen ? 'w-64' : 'w-20',
        'hidden md:flex',
      )}
    >
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-md glow-primary">
            T
          </div>
          {isOpen && (
            <span className="font-heading text-xl font-extrabold tracking-tight text-foreground">
              Trash Here
            </span>
          )}
        </div>
      </div>

      {/* Navigation Links Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {children ? (
          children
        ) : (
          <>
            <SidebarSection title={isOpen ? 'Milestone 2' : undefined}>
              <SidebarItem
                to="/"
                icon={<Sparkles />}
                label="Design System"
                badge="M2"
                isCollapsed={!isOpen}
              />
            </SidebarSection>

            <SidebarSection title={isOpen ? 'Workspaces' : undefined}>
              <SidebarItem
                to="/app"
                icon={<Home />}
                label="Household App"
                badge="M3"
                isCollapsed={!isOpen}
              />
              <SidebarItem
                to="/app/book"
                icon={<Calendar />}
                label="Book Pickup"
                badge="M3.2"
                isCollapsed={!isOpen}
              />
              <SidebarItem
                to="/app/tracking"
                icon={<Navigation />}
                label="Live Tracking"
                badge="M3.3"
                isCollapsed={!isOpen}
              />
              <SidebarItem
                to="/app/wallet"
                icon={<Wallet />}
                label="Wallet & Ledger"
                badge="S5"
                isCollapsed={!isOpen}
              />
              <SidebarItem
                to="/app/rewards"
                icon={<Gift />}
                label="Rewards Store"
                badge="S5"
                isCollapsed={!isOpen}
              />
              <SidebarItem
                to="/app/subscriptions"
                icon={<Crown />}
                label="Eco Subscriptions"
                badge="S5"
                isCollapsed={!isOpen}
              />
              <SidebarItem
                to="/app/notifications"
                icon={<Bell />}
                label="Notifications"
                badge="S6"
                isCollapsed={!isOpen}
              />
              <SidebarItem
                to="/app/settings"
                icon={<Sliders />}
                label="Profile & Settings"
                badge="S6"
                isCollapsed={!isOpen}
              />
              <SidebarItem
                to="/collector"
                icon={<Recycle />}
                label="Collector Feed"
                badge="S7"
                isCollapsed={!isOpen}
              />
              <SidebarItem
                to="/admin"
                icon={<ShieldAlert />}
                label="Admin Dashboard"
                badge="M5"
                isCollapsed={!isOpen}
              />
            </SidebarSection>
          </>
        )}
      </div>

      {/* Footer Area */}
      <div className="p-4 border-t border-border/40">
        <div className="flex items-center gap-3 px-2 py-2 rounded-2xl bg-muted/50">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
            E
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">Enterprise Pro</span>
              <span className="text-[10px] text-muted-foreground">v1.0.0 Prod</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <div className="space-y-1.5">
      {title && (
        <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
};

export interface SidebarItemProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
  badge?: string | number;
  isCollapsed?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  icon,
  label,
  badge,
  isCollapsed = false,
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 select-none',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm glow-primary'
            : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          {icon && (
            <span
              className={cn(
                'h-5 w-5 transition-transform group-hover:scale-110',
                isActive && 'text-current',
              )}
            >
              {icon}
            </span>
          )}
          {!isCollapsed && <span className="flex-1 truncate">{label}</span>}
          {!isCollapsed && badge !== undefined && (
            <span
              className={cn(
                'ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold',
                isActive ? 'bg-black/20 text-current' : 'bg-primary/20 text-foreground',
              )}
            >
              {badge}
            </span>
          )}
          {isActive && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-foreground dark:bg-background"
            />
          )}
        </>
      )}
    </NavLink>
  );
};
