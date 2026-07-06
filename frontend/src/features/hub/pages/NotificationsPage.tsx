import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Check,
  AlertTriangle,
  Info,
  Sparkles,
  Clock,
  Recycle,
  CreditCard,
  Wallet,
  Gift,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
  type NotificationItem,
} from '../api/hub.api';
import { socketService } from '../services/socket.service';

const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'PICKUP', label: 'Pickups' },
  { id: 'PAYMENT', label: 'Payments' },
  { id: 'WALLET', label: 'Wallet & Ledger' },
  { id: 'REWARD', label: 'Rewards Store' },
  { id: 'SECURITY', label: 'Security Alerts' },
  { id: 'SYSTEM', label: 'System Notices' },
  { id: 'PROMOTION', label: 'Promotions' },
];

const READ_FILTERS = [
  { id: '', label: 'All Status' },
  { id: 'false', label: 'Unread Only' },
  { id: 'true', label: 'Read Only' },
];

export const NotificationsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedReadStatus, setSelectedReadStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch, isRefetching } = useNotifications({
    category: selectedCategory || undefined,
    isRead: selectedReadStatus || undefined,
    page,
    limit,
  });

  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();
  const deleteMutation = useDeleteNotification();

  const handleMarkRead = (id: string, currentStatus: boolean) => {
    markReadMutation.mutate({ id, isRead: !currentStatus });
    socketService.markReadSocket(id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PICKUP':
        return <Recycle className="h-5 w-5 text-emerald-500" />;
      case 'PAYMENT':
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'WALLET':
        return <Wallet className="h-5 w-5 text-purple-500" />;
      case 'REWARD':
        return <Gift className="h-5 w-5 text-pink-500" />;
      case 'SECURITY':
        return <ShieldAlert className="h-5 w-5 text-amber-500" />;
      case 'PROMOTION':
        return <Sparkles className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <Badge variant="error" className="animate-pulse font-extrabold">
            🚨 Critical
          </Badge>
        );
      case 'HIGH':
        return (
          <Badge variant="warning" className="font-bold">
            ⚡ High
          </Badge>
        );
      case 'NORMAL':
        return (
          <Badge variant="info" className="font-bold">
            ℹ️ Normal
          </Badge>
        );
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold">
              <Bell className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sprint 6 • Real-Time Engine
            </span>
          </div>
          <h1 className="font-heading text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            Notification Center
            {data && data.total > 0 && (
              <span className="text-sm font-extrabold px-3 py-1 rounded-full bg-primary/20 text-foreground">
                {data.total} Total
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live enterprise feed synchronized via WebSocket cluster across all devices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="rounded-2xl font-bold border-border/60"
            title="Refresh Feed"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin text-primary' : ''}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || !data?.items?.length}
            className="rounded-2xl font-extrabold shadow-md glow-primary"
          >
            <Check className="mr-2 h-4 w-4" />
            Mark All As Read
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-md shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Read Status */}
          <div className="flex gap-2">
            {READ_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedReadStatus(f.id);
                  setPage(1);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                  selectedReadStatus === f.id
                    ? 'bg-foreground text-background shadow-md'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown/Pills */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground font-extrabold shadow-sm glow-primary'
                    : 'bg-background border border-border/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat.id && getCategoryIcon(cat.id)}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notification List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-5 border-border/60 bg-card flex gap-4">
                <Skeleton variant="circular" width="48px" height="48px" />
                <div className="flex-1 space-y-3">
                  <Skeleton variant="text" width="40%" height="1.25rem" />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="text" width="60%" />
                </div>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="p-12 text-center border-destructive/40 bg-destructive/5 max-w-xl mx-auto space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h3 className="font-heading text-lg font-bold text-foreground">
              Failed to load notifications
            </h3>
            <p className="text-xs text-muted-foreground">
              We encountered an error connecting to the notification engine. Please retry.
            </p>
            <Button onClick={() => refetch()} className="rounded-xl font-bold">
              Retry Connection
            </Button>
          </Card>
        ) : !data || data.items.length === 0 ? (
          <Card className="p-16 text-center border-border/60 bg-card max-w-xl mx-auto space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary mx-auto">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-xl font-black text-foreground">
              No Notifications Found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You're completely up to date! There are no alerts matching your selected category and
              read status filters.
            </p>
            {(selectedCategory || selectedReadStatus) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedReadStatus('');
                  setPage(1);
                }}
                className="rounded-xl text-xs font-bold"
              >
                Clear All Filters
              </Button>
            )}
          </Card>
        ) : (
          <AnimatePresence>
            {data.items.map((item: NotificationItem) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative flex gap-5 rounded-3xl border p-5 transition-all duration-200 ${
                  item.isRead
                    ? 'border-border/60 bg-card/70 opacity-85 hover:opacity-100 hover:bg-card'
                    : 'border-primary/50 bg-card shadow-lg hover:border-primary'
                }`}
              >
                {/* Category Icon */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted/80 border border-border/40 shadow-sm">
                    {getCategoryIcon(item.category)}
                  </div>
                  {!item.isRead && (
                    <span
                      className="h-2.5 w-2.5 rounded-full bg-primary glow-primary animate-pulse"
                      title="Unread"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading text-md font-extrabold text-foreground">
                        {item.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold uppercase tracking-wider"
                      >
                        {item.category}
                      </Badge>
                    </div>
                    {getPriorityBadge(item.priority)}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed break-words">
                    {item.message}
                  </p>

                  {/* Metadata preview if any */}
                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/30 text-xs font-mono text-muted-foreground max-w-lg truncate">
                      {JSON.stringify(item.metadata)}
                    </div>
                  )}

                  {/* Footer & Actions */}
                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-border/30 gap-4">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {new Date(item.createdAt).toLocaleString()} ({formatTimeAgo(item.createdAt)})
                    </span>

                    <div className="flex items-center gap-2">
                      {item.actionUrl && (
                        <a
                          href={item.actionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground shadow-sm hover:bg-primary/90 glow-primary"
                        >
                          Explore <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkRead(item.id, item.isRead)}
                        disabled={markReadMutation.isPending}
                        className="rounded-xl text-xs font-bold h-8 border-border/60"
                      >
                        <CheckCircle2
                          className={`mr-1.5 h-3.5 w-3.5 ${item.isRead ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                        {item.isRead ? 'Mark Unread' : 'Mark Read'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                        className="rounded-xl h-8 w-8 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination Footer */}
      {data && data.totalPages > 1 && (
        <Card className="flex items-center justify-between p-4 border-border/60 bg-card shadow-md">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="rounded-xl font-bold text-xs"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous Page
          </Button>
          <span className="text-xs font-extrabold text-foreground">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages || isLoading}
            className="text-xs rounded-xl font-bold"
          >
            Next Page <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
      )}
    </div>
  );
};
