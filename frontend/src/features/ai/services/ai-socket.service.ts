import { io, Socket } from 'socket.io-client';
import { type QueryClient } from '@tanstack/react-query';
import { envConfig } from '@/config/env.config';
import { TOKEN_KEY } from '@/common/api/client';
import { toast } from '@/common/notifications/toast';
import type { RealtimePredictionEvent } from '../types/ai.types';

class AiSocketService {
  private socket: Socket | null = null;
  private isConnecting = false;

  public connect(queryClient: QueryClient) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;

    const origin = envConfig.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
    const url = `${origin}/ai`;

    this.socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log('⚡ [AI WebSocket] Connected to AI Gateway:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
      console.log('🔴 [AI WebSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      this.isConnecting = false;
      console.warn('⚠️ [AI WebSocket] Connection error:', err.message);
    });

    this.socket.on('ai:prediction:completed', (data: RealtimePredictionEvent) => {
      console.log('✨ [AI WebSocket] Prediction Completed:', data);
      toast.success('AI waste detection complete! Results are ready.');
      queryClient.invalidateQueries({ queryKey: ['ai', 'predictions'] });
      if (data.jobId) {
        queryClient.setQueryData(['ai', 'job-status', data.jobId], {
          status: 'COMPLETED',
          jobId: data.jobId,
          predictionId: data.predictionId,
        });
      }
      if (data.predictionId) {
        queryClient.invalidateQueries({ queryKey: ['ai', 'prediction', data.predictionId] });
      }
    });

    this.socket.on('ai:prediction:updated', (data: RealtimePredictionEvent) => {
      console.log('🔄 [AI WebSocket] Prediction Updated:', data);
      queryClient.invalidateQueries({ queryKey: ['ai', 'predictions'] });
      if (data.predictionId) {
        queryClient.invalidateQueries({ queryKey: ['ai', 'prediction', data.predictionId] });
      }
    });

    this.socket.on('ai:job:failed', (data: RealtimePredictionEvent) => {
      console.warn('❌ [AI WebSocket] Job Failed:', data);
      toast.error(`AI detection failed: ${data.errorMessage || 'Processing error'}`);
      queryClient.invalidateQueries({ queryKey: ['ai', 'predictions'] });
      if (data.jobId) {
        queryClient.setQueryData(['ai', 'job-status', data.jobId], {
          status: 'FAILED',
          jobId: data.jobId,
          errorMessage: data.errorMessage,
        });
      }
    });

    this.socket.on('ai:job:progress', (data: RealtimePredictionEvent) => {
      console.log('⏳ [AI WebSocket] Job Progress:', data);
      if (data.jobId) {
        queryClient.setQueryData(['ai', 'job-status', data.jobId], {
          status: 'PROCESSING',
          jobId: data.jobId,
        });
      }
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const aiSocketService = new AiSocketService();
