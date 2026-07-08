import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { aiApi } from '../api/ai.api';
import { aiSocketService } from '../services/ai-socket.service';
import type {
  UploadUrlRequest,
  UploadUrlResponse,
  AnalyzeRequest,
  AnalyzeResponse,
  AiPrediction,
  AiJobStatus,
} from '../types/ai.types';

export const AI_QUERY_KEYS = {
  all: ['ai'] as const,
  predictions: () => [...AI_QUERY_KEYS.all, 'predictions'] as const,
  prediction: (id: string) => [...AI_QUERY_KEYS.all, 'prediction', id] as const,
  jobStatus: (jobId: string) => [...AI_QUERY_KEYS.all, 'job-status', jobId] as const,
};

/**
 * Hook to request presigned upload URL from backend.
 */
export function useCreateUploadUrl() {
  return useMutation<UploadUrlResponse, Error, UploadUrlRequest>({
    mutationFn: (data) => aiApi.getUploadUrl(data),
  });
}

/**
 * Hook to directly upload image binary to S3/R2.
 */
export function useUploadImage() {
  return useMutation<
    void,
    Error,
    {
      presignedUrl: string;
      file: File | Blob;
      onProgress?: (progress: { loaded: number; total?: number }) => void;
    }
  >({
    mutationFn: ({ presignedUrl, file, onProgress }) =>
      aiApi.uploadToS3(presignedUrl, file, onProgress),
  });
}

/**
 * Hook to trigger AI waste detection analysis after image upload.
 */
export function useAnalyzeImage() {
  const queryClient = useQueryClient();

  return useMutation<AnalyzeResponse, Error, AnalyzeRequest>({
    mutationFn: (data) => aiApi.analyzeImage(data),
    onSuccess: (data) => {
      queryClient.setQueryData(AI_QUERY_KEYS.jobStatus(data.jobId), {
        status: data.status,
        jobId: data.jobId,
      });
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.predictions() });
    },
  });
}

/**
 * Hook to fetch prediction history with automatic cache invalidation.
 */
export function usePredictionHistory(limit = 20, offset = 0) {
  return useQuery<AiPrediction[], Error>({
    queryKey: [...AI_QUERY_KEYS.predictions(), { limit, offset }],
    queryFn: () => aiApi.getPredictionHistory(limit, offset),
    staleTime: 30000,
  });
}

/**
 * Hook to fetch detailed synthesis report for a specific prediction ID.
 */
export function usePrediction(
  predictionId: string,
  options?: Omit<UseQueryOptions<AiPrediction, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<AiPrediction, Error>({
    queryKey: AI_QUERY_KEYS.prediction(predictionId),
    queryFn: () => aiApi.getPredictionById(predictionId),
    enabled: !!predictionId,
    ...options,
  });
}

/**
 * Hook to poll or check job status with fallback polling if job is active.
 */
export function useJobStatus(jobId: string) {
  return useQuery<{ status: AiJobStatus; jobId: string; predictionId?: string }, Error>({
    queryKey: AI_QUERY_KEYS.jobStatus(jobId),
    queryFn: () => aiApi.getJobStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'QUEUED' || status === 'PROCESSING') {
        return 2000; // Poll every 2s until completed or failed
      }
      return false;
    },
  });
}

/**
 * Hook to retry a failed detection job.
 */
export function useRetryJob() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; jobId: string }, Error, string>({
    mutationFn: (jobId) => aiApi.retryJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.setQueryData(AI_QUERY_KEYS.jobStatus(jobId), {
        status: 'QUEUED',
        jobId,
      });
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.predictions() });
    },
  });
}

/**
 * Hook to connect to AI Socket.IO real-time gateway and listen for updates.
 */
export function useRealtimePrediction() {
  const queryClient = useQueryClient();

  useEffect(() => {
    aiSocketService.connect(queryClient);
    return () => {
      aiSocketService.disconnect();
    };
  }, [queryClient]);
}
