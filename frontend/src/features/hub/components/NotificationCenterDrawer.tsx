import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'PICKUP', label: 'Pickups' },
  { id: 'PAYMENT', label: 'Payments' },
  { id: 'WALLET', label: 'Wallet' },
  { id: 'REWARD', label: 'Rewards' },
  { id: 'SECURITY', label: 'Security' },
  { id: 'SYSTEM', label: 'System' },
  { id: 'PROMOTION', label: 'Promos' },
];

const READ_FILTERS = [
  { id: '', label: 'All' },
  { id: 'false', label: 'Unread' },
  { id: 'true', label: 'Read' },
];

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedReadStatus, setSelectedReadStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading, isError } = useNotifications({
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
        return <Recycle className="h-4 w-4 text-emerald-500" />;
      case 'PAYMENT':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'WALLET':
        return <Wallet className="h-4 w-4 text-purple-500" />;
      case 'REWARD':
        return <Gift className="h-4 w-4 text-pink-500" />;
      case 'SECURITY':
        return <ShieldAlert className="h-4 w-4 text-amber-500" />;
      case 'PROMOTION':
        return <Sparkles className="h-4 w-4 text-primary" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <Badge variant="error" className="animate-pulse">
            Critical
          </Badge>
        );
      case 'HIGH':
        return <Badge variant="warning">High</Badge>;
      case 'NORMAL':
        return <Badge variant="info">Normal</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-border/60 bg-card/95 backdrop-blur-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 p-5">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-extrabold tracking-tight text-foreground">
                  Notification Center
                </h3>
                {data && data.total > 0 && (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-foreground">
                    {data.total}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending || !data?.items?.length}
                  className="text-xs text-muted-foreground hover:text-foreground"
                  title="Mark all as read"
                >
                  <Check className="mr-1 h-3.5 w-3.5 text-primary" />
                  Read All
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-xl hover:bg-muted"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Filters Section */}
            <div className="space-y-3 border-b border-border/40 p-4 bg-muted/20">
              {/* Read status filter */}
              <div className="flex gap-1.5">
                {READ_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setSelectedReadStatus(f.id);
                      setPage(1);
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      selectedReadStatus === f.id
                        ? 'bg-foreground text-background shadow-sm'
                        : 'bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setPage(1);
                    }}
                    className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground font-bold shadow-sm glow-primary'
                        : 'bg-card border border-border/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {cat.id && getCategoryIcon(cat.id)}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 rounded-2xl border border-border/40 bg-card"
                    >
                      <Skeleton variant="circular" width="36px" height="36px" />
                      <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="text" width="90%" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
                  <p className="text-sm font-bold text-foreground">Failed to load notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please check your network connection.
                  </p>
                </div>
              ) : !data || data.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-3">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-bold text-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You have no notifications matching the selected filters.
                  </p>
                </div>
              ) : (
                data.items.map((item: NotificationItem) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group relative flex gap-3.5 rounded-2xl border p-3.5 transition-all ${
                      item.isRead
                        ? 'border-border/40 bg-card/60 opacity-75 hover:opacity-100'
                        : 'border-primary/40 bg-card shadow-sm hover:border-primary/80'
                    }`}
                  >
                    {/* Unread dot / Category Icon */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-muted/80 border border-border/40">
                        {getCategoryIcon(item.category)}
                      </div>
                      {!item.isRead && (
                        <span
                          className="h-2 w-2 rounded-full bg-primary glow-primary"
                          title="Unread"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-foreground truncate">
                          {item.title}
                        </span>
                        {getPriorityBadge(item.priority)}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed break-words mb-2">
                        {item.message}
                      </p>

                      {/* Footer info & Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/30">
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(item.createdAt)}
                        </span>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {item.actionUrl && (
                            <a
                              href={item.actionUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-foreground hover:bg-primary/20"
                            >
                              View <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}

                          <button
                            onClick={() => handleMarkRead(item.id, item.isRead)}
                            disabled={markReadMutation.isPending}
                            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title={item.isRead ? 'Mark as unread' : 'Mark as read'}
                          >
                            <CheckCircle2
                              className={`h-3.5 w-3.5 ${item.isRead ? 'text-primary' : 'text-muted-foreground'}`}
                            />
                          </button>

                          <button
                            onClick={() => deleteMutation.mutate(item.id)}
                            disabled={deleteMutation.isPending}
                            className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                            title="Delete notification"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination Footer */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/40 p-3 bg-muted/20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="text-xs h-8"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <span className="text-xs font-bold text-muted-foreground">
                  Page {data.page} of {data.totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages || isLoading}
                  className="text-xs h-8"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Bottom Link to Full Page */}
            <div className="border-t border-border/40 p-3 text-center bg-card">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  navigate('/app/notifications');
                }}
                className="w-full text-xs font-bold rounded-xl border-border/60 hover:bg-muted"
              >
                Open Full Notification Center
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
