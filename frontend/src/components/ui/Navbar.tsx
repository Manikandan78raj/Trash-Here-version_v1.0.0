import React from 'react';
import { Menu, Sun, Moon, Laptop, Bell, User } from 'lucide-react';
import { useTheme } from '@/common/theme/useTheme';
import { useAuth } from '@/common/auth/useAuth';
import { Button } from './Button';

export interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-xl">
      {/* Left side: Menu Toggle & Brand */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="rounded-2xl hover:bg-muted md:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-black text-primary-foreground">
            T
          </div>
          <span className="font-heading font-bold text-lg">Trash Here</span>
        </div>
      </div>

      {/* Right side: Actions & User Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-2xl hover:bg-muted/80 border border-border/40"
          title={`Current theme: ${theme}`}
          aria-label="Toggle Theme"
        >
          {theme === 'light' && <Sun className="h-5 w-5 text-amber-500" />}
          {theme === 'dark' && <Moon className="h-5 w-5 text-primary" />}
          {theme === 'system' && <Laptop className="h-5 w-5 text-muted-foreground" />}
        </Button>

        {/* Notifications Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-2xl hover:bg-muted/80 border border-border/40"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary glow-primary" />
        </Button>

        {/* User Profile Snippet */}
        <div className="flex items-center gap-3 pl-2 border-l border-border/40">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-foreground font-bold border border-primary/30">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="hidden flex-col md:flex">
            <span className="text-sm font-bold text-foreground leading-none">
              {user?.fullName || 'Guest User'}
            </span>
            <span className="text-xs text-muted-foreground leading-tight pt-0.5 uppercase tracking-wider font-semibold">
              {user?.role?.name || 'HOUSEHOLD'}
            </span>
          </div>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-xs text-muted-foreground hover:text-destructive hidden lg:inline-flex ml-1"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
