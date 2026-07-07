import axios from 'axios';
import { apiClient } from '@/common/api/client';
import type {
  UploadUrlRequest,
  UploadUrlResponse,
  AnalyzeRequest,
  AnalyzeResponse,
  AiPrediction,
  AiJobStatus,
} from '../types/ai.types';

export const aiApi = {
  /**
   * Request a presigned URL for direct-to-S3 image upload.
   */
  getUploadUrl: async (data: UploadUrlRequest): Promise<UploadUrlResponse> => {
    const response = await apiClient.post<UploadUrlResponse>('/ai/upload-url', data);
    return response.data;
  },

  /**
   * Directly upload image binary to S3/R2 using presigned URL.
   * Uses clean axios instance without Authorization header to avoid S3 SignatureDoesNotMatch errors.
   */
  uploadToS3: async (
    presignedUrl: string,
    file: File | Blob,
    onProgress?: (progressEvent: { loaded: number; total?: number }) => void,
  ): Promise<void> => {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type || 'image/jpeg',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({ loaded: progressEvent.loaded, total: progressEvent.total });
        }
      },
    });
  },

  /**
   * Trigger AI waste detection analysis on uploaded S3 storage key.
   */
  analyzeImage: async (data: AnalyzeRequest): Promise<AnalyzeResponse> => {
    const response = await apiClient.post<AnalyzeResponse>('/ai/analyze', data);
    return response.data;
  },

  /**
   * Retrieve prediction history for the authenticated user or collector.
   */
  getPredictionHistory: async (limit = 20, offset = 0): Promise<AiPrediction[]> => {
    const response = await apiClient.get<AiPrediction[]>('/ai/predictions', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Get detailed synthesis report for a specific prediction ID.
   */
  getPredictionById: async (predictionId: string): Promise<AiPrediction> => {
    const response = await apiClient.get<AiPrediction>(`/ai/predictions/${predictionId}`);
    return response.data;
  },

  /**
   * Check processing queue status of an active job.
   */
  getJobStatus: async (jobId: string): Promise<{ status: AiJobStatus; jobId: string }> => {
    const response = await apiClient.get<{ status: AiJobStatus; jobId: string }>(
      `/ai/jobs/${jobId}/status`,
    );
    return response.data;
  },

  /**
   * Retry a failed job in the BullMQ queue.
   */
  retryJob: async (jobId: string): Promise<{ success: boolean; jobId: string }> => {
    const response = await apiClient.post<{ success: boolean; jobId: string }>(
      `/ai/jobs/${jobId}/retry`,
    );
    return response.data;
  },
};
