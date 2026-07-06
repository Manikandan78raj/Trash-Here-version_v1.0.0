import { io, Socket } from 'socket.io-client';
import { type QueryClient } from '@tanstack/react-query';
import { envConfig } from '@/config/env.config';
import { TOKEN_KEY } from '@/common/api/client';
import { toast } from '@/common/notifications/toast';

class LogisticsSocketService {
  private socket: Socket | null = null;
  private isConnecting = false;

  public connect(queryClient: QueryClient) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;

    // Derive base origin from apiBaseUrl
    const origin = envConfig.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
    const url = `${origin}/logistics`;

    this.socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log('⚡ [WebSocket] Connected to Logistics Fleet Gateway:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
      console.log('🔴 [WebSocket] Logistics Gateway Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      this.isConnecting = false;
      console.warn('⚠️ [WebSocket] Logistics Connection error:', err.message);
    });

    // Handle real-time location broadcasts
    this.socket.on(
      'collector:location',
      (_data: { collectorId: string; lat: number; lng: number; timestamp: string }) => {
        // Invalidate route or dashboard queries if relevant
        queryClient.invalidateQueries({ queryKey: ['collector', 'dashboard'] });
      },
    );

    // Handle job status transitions
    this.socket.on(
      'pickup:status',
      (data: { pickupId: string; status: string; details: any; timestamp: string }) => {
        if (data.status === 'ARRIVED') {
          toast.info('📍 Stop Status Updated: ARRIVED', 'Household has been notified of arrival.');
        } else if (data.status === 'COMPLETED') {
          toast.success('✅ Job Completed via Geofence QR', 'Green points & cash payout credited.');
        }
        queryClient.invalidateQueries({ queryKey: ['collector'] });
      },
    );
  }

  public joinPickupRoom(pickupId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join:pickup', { pickupId });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }
}

export const logisticsSocketService = new LogisticsSocketService();
