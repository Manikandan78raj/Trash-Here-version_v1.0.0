import { motion } from 'framer-motion';
import { Bell, CheckCircle2, TrendingUp, Sparkles, Clock, Check } from 'lucide-react';
import { Card, Heading, Text, Badge } from '@/components/ui';
import { useNotifications, useMarkNotificationRead } from '../api/household.api';

export const NotificationsPreview = () => {
  const { data: realNotifications } = useNotifications();
  const markReadMutation = useMarkNotificationRead();

  const defaultNotifications = [
    {
      id: 'notif-1',
      title: 'Stripe Payout Completed',
      message:
        'Your withdrawal request of $42.50 has been successfully deposited into your connected bank account.',
      time: '2 hours ago',
      type: 'PAYOUT',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      badgeVariant: 'success' as const,
      badgeText: 'Finance',
      isRead: true,
    },
    {
      id: 'notif-2',
      title: 'Tier Level Upgraded!',
      message:
        'Congratulations! You reached 750 Eco Score points and unlocked the "Eco Warrior" enterprise status.',
      time: '1 day ago',
      type: 'REWARD',
      icon: <Sparkles className="h-4 w-4 text-primary" />,
      badgeVariant: 'default' as const,
      badgeText: 'Milestone',
      isRead: true,
    },
    {
      id: 'notif-3',
      title: 'Weekend Surge Pricing Active',
      message:
        'Recycling companies are offering +20% bonus rates on Electronic Waste and Copper through Sunday.',
      time: '2 days ago',
      type: 'MARKET',
      icon: <TrendingUp className="h-4 w-4 text-purple-400" />,
      badgeVariant: 'warning' as const,
      badgeText: 'Market Alert',
      isRead: true,
    },
  ];

  const formattedReal = (realNotifications || []).map((notif) => {
    let icon = <Bell className="h-4 w-4 text-primary" />;
    let badgeVariant: 'default' | 'success' | 'warning' | 'info' | 'error' = 'default';
    let badgeText = 'System';

    if (notif.type === 'REWARD') {
      icon = <Sparkles className="h-4 w-4 text-primary" />;
      badgeVariant = 'success';
      badgeText = 'Reward';
    } else if (notif.type === 'PICKUP') {
      icon = <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      badgeVariant = 'info';
      badgeText = 'Pickup';
    } else if (notif.type === 'ALERT') {
      icon = <TrendingUp className="h-4 w-4 text-destructive" />;
      badgeVariant = 'error';
      badgeText = 'Alert';
    }

    const diffMins = Math.round((Date.now() - new Date(notif.createdAt).getTime()) / 60000);
    const timeStr =
      diffMins < 1
        ? 'Just now'
        : diffMins < 60
          ? `${diffMins}m ago`
          : diffMins < 1440
            ? `${Math.round(diffMins / 60)}h ago`
            : `${Math.round(diffMins / 1440)}d ago`;

    return {
      id: notif.id,
      title: notif.title,
      message: notif.message,
      time: timeStr,
      type: notif.type,
      icon,
      badgeVariant,
      badgeText,
      isRead: notif.isRead,
    };
  });

  const displayNotifications = formattedReal.length > 0 ? formattedReal : defaultNotifications;
  const unreadCount = displayNotifications.filter((n) => !n.isRead).length;

  return (
    <Card className="p-6 md:p-8 border-border/60 bg-card/80 backdrop-blur-xl shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary relative">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-ping" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
              </>
            )}
          </div>
          <div>
            <Heading level={2} className="text-xl md:text-2xl font-bold tracking-tight">
              System Notifications
            </Heading>
            <Text variant="small" className="text-muted-foreground">
              Live updates from waste collectors and recycling market feeds
            </Text>
          </div>
        </div>
        <Badge variant={unreadCount > 0 ? 'info' : 'default'} className="font-mono text-xs">
          {unreadCount > 0 ? `${unreadCount} New` : 'All Read'}
        </Badge>
      </div>

      <div className="space-y-3">
        {displayNotifications.map((notif, index) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: index * 0.08 }}
            onClick={() => {
              if (!notif.isRead && notif.id.startsWith('notif-') === false) {
                markReadMutation.mutate(notif.id);
              }
            }}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
              notif.isRead
                ? 'bg-background/40 border-border/30 opacity-80'
                : 'bg-background/80 hover:bg-background border-primary/30 shadow-sm'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-muted/80 border border-border/50 shrink-0 mt-0.5">
              {notif.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <Text variant="small" className="font-bold text-foreground truncate">
                    {notif.title}
                  </Text>
                  {!notif.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </div>
                <Badge
                  variant={notif.badgeVariant}
                  size="sm"
                  className="text-[10px] font-mono shrink-0"
                >
                  {notif.badgeText}
                </Badge>
              </div>

              <Text
                variant="small"
                className="text-muted-foreground text-xs mt-1 block leading-relaxed"
              >
                {notif.message}
              </Text>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                  <Clock className="h-3 w-3" />
                  <span>{notif.time}</span>
                </div>
                {!notif.isRead && (
                  <span className="text-[10px] text-primary flex items-center gap-1 font-mono">
                    <Check className="h-3 w-3" /> Mark read
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};
