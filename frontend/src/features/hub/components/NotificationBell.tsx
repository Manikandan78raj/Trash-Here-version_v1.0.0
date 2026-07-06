import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUnreadCount } from '../api/hub.api';
import { NotificationCenterDrawer } from './NotificationCenterDrawer';

export const NotificationBell: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsDrawerOpen(true)}
        className="relative rounded-2xl hover:bg-muted/80 border border-border/40 transition-all duration-200"
        aria-label="Notifications"
        title="View Notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-black text-primary-foreground shadow-sm glow-primary animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      <NotificationCenterDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
