import { AiJobStatus, AiModelType, AiRecommendationType } from "@prisma/client";

export interface BoundingBox {
  xMin: number; // Normalized 0.0 to 1.0
  yMin: number; // Normalized 0.0 to 1.0
  xMax: number; // Normalized 0.0 to 1.0
  yMax: number; // Normalized 0.0 to 1.0
}

export interface DetectedObjectResult {
  label: string;
  confidence: number; // 0.0 to 1.0
  boundingBox: BoundingBox;
  materialType: string;
  isContaminant: boolean;
}

export interface AiDetectionResponse {
  modelName: string;
  processingTimeMs: number;
  overallConfidence: number;
  detectionConfidence?: number;
  classificationConfidence?: number;
  recommendationConfidence?: number;
  providerName?: string;
  modelVersion?: string;
  processingCostUsd?: number;
  primaryMaterialCategory: string;
  isContaminated: boolean;
  contaminationPercentage: number; // 0.0 to 100.0
  recommendationType: AiRecommendationType;
  actionableInstructions: string;
  estimatedWeightKg: number;
  co2SavedKg: number;
  greenPointsEarned: number;
  detectedObjects: DetectedObjectResult[];
  rawVendorPayload?: any;
}

export interface IAiDetectionProvider {
  /**
   * Executes computer vision detection and classification on an image URL or buffer.
   */
  detectWaste(
    imageUrl: string,
    options?: { minConfidence?: number; maxObjects?: number },
  ): Promise<AiDetectionResponse>;

  /**
   * Returns the model metadata and health status.
   */
  getHealth(): Promise<{
    isHealthy: boolean;
    modelVersion: string;
    latencyMs: number;
  }>;
}

export interface AiQueueJobPayload {
  jobId: string;
  imageId: string;
  storageKey: string;
  sha256Hash: string;
  modelType: AiModelType;
  userId?: string;
  loadId?: string;
}

export interface AiQueueJobOptions {
  attempts?: number;
  backoff?: {
    type: "exponential" | "fixed";
    delay: number;
  };
  timeout?: number;
  removeOnComplete?: boolean;
}

export interface IAiQueueProvider {
  /**
   * Enqueues an AI detection job for asynchronous worker processing.
   */
  addJob(
    jobName: string,
    payload: AiQueueJobPayload,
    options?: AiQueueJobOptions,
  ): Promise<string>;

  /**
   * Registers a worker consumer handler for processing queued jobs.
   */
  processJobs(
    handler: (job: { id: string; data: AiQueueJobPayload }) => Promise<void>,
  ): void;

  /**
   * Retrieves the current status of a queued or completed job.
   */
  getJobStatus(jobId: string): Promise<AiJobStatus>;

  /**
   * Returns live queue metrics including active, waiting, completed, and dead-letter queue counts.
   */
  getQueueMetrics(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    dlqCount: number;
  }>;
}
