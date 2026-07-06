import { io, Socket } from 'socket.io-client';
import { type QueryClient } from '@tanstack/react-query';
import { envConfig } from '@/config/env.config';
import { TOKEN_KEY } from '@/common/api/client';
import { toast } from '@/common/notifications/toast';
import type { NotificationItem } from '../api/hub.api';

class SocketService {
  private socket: Socket | null = null;
  private isConnecting = false;

  public connect(queryClient: QueryClient) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;

    // Derive base origin (e.g. http://localhost:3000) from apiBaseUrl
    const origin = envConfig.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
    const url = `${origin}/notifications`;

    this.socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log('⚡ [WebSocket] Connected to Notification Gateway:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
      console.log('🔴 [WebSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      this.isConnecting = false;
      console.warn('⚠️ [WebSocket] Connection error:', err.message);
    });

    // Handle real-time unread badge counter updates
    this.socket.on('notification:badge', (data: { unreadCount: number }) => {
      if (typeof data?.unreadCount === 'number') {
        queryClient.setQueryData(['notifications', 'unread-count'], data.unreadCount);
      }
    });

    // Handle incoming real-time notifications
    this.socket.on('notification:new', (notification: NotificationItem) => {
      // Display rich toast notification
      const isCritical = notification.priority === 'CRITICAL' || notification.priority === 'HIGH';
      if (isCritical) {
        toast.error(`🚨 ${notification.title}: ${notification.message}`);
      } else {
        toast.success(`📢 ${notification.title}`, notification.message);
      }

      // Automatically synchronize TanStack Query caches
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  public markReadSocket(notificationId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('notification:mark_read', { notificationId });
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
