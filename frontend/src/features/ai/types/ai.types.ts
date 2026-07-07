export type AiJobStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type AiModelType =
  | 'YOLO_V8'
  | 'OPENAI_GPT4O_VISION'
  | 'GEMINI_1_5_PRO_VISION'
  | 'CUSTOM_RESNET'
  | 'MOCK_VISION'
  | 'HYBRID_VISION';

export type AiRecommendationType =
  | 'DIRECT_RECYCLE'
  | 'REQUIRES_RINSING'
  | 'REQUIRES_DISASSEMBLY'
  | 'CONTAMINATED_DISPOSE'
  | 'HAZARDOUS_SPECIAL_HANDLE';

export interface BoundingBox {
  xMin: number; // Normalized 0.0 to 1.0
  yMin: number;
  xMax: number;
  yMax: number;
}

export interface DetectedObject {
  id?: string;
  label: string;
  confidenceScore: number; // 0.0 to 1.0
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  materialType: string;
  isContaminant: boolean;
}

export interface AiPrediction {
  id: string;
  jobId: string;
  imageId: string;
  primaryCategoryId?: string | null;
  isContaminated: boolean;
  contaminationRate: number; // 0.0 to 100.0
  detectionConfidence?: number;
  classificationConfidence?: number;
  recommendationConfidence?: number;
  overallConfidence: number; // 0.0 to 1.0
  providerName?: string;
  modelVersion?: string;
  processingLatencyMs?: number;
  processingCostUsd?: number | null;
  recommendationType: AiRecommendationType;
  recommendationText: string;
  estimatedWeightKg: number;
  co2SavedKg: number;
  greenPointsEarned: number;
  rawPayload?: string | null;
  createdAt: string;
  detectedObjects?: DetectedObject[];
}

export interface AiImageUpload {
  id: string;
  userId?: string | null;
  loadId?: string | null;
  fileUrl: string;
  storageKey: string;
  fileSizeBytes: number;
  mimeType: string;
  widthPx?: number | null;
  heightPx?: number | null;
  sha256Hash: string;
  createdAt: string;
}

export interface AiProcessingJob {
  id: string;
  jobId: string; // BullMQ Redis Job ID
  imageId: string;
  modelVersionId?: string | null;
  status: AiJobStatus;
  attempts: number;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  processingMs?: number | null;
  createdAt: string;
  updatedAt: string;
  image?: AiImageUpload;
  predictions?: AiPrediction[];
}

export interface UploadUrlRequest {
  mimeType: string;
  fileSizeBytes: number;
}

export interface UploadUrlResponse {
  presignedUrl: string;
  storageKey: string;
  uploadId: string;
}

export interface AnalyzeRequest {
  storageKey: string;
  sha256Hash: string;
  modelType?: AiModelType;
  loadId?: string;
}

export interface AnalyzeResponse {
  jobId: string;
  status: AiJobStatus;
  estimatedWaitMs?: number;
}

export interface RealtimePredictionEvent {
  jobId: string;
  predictionId?: string;
  status?: AiJobStatus;
  errorMessage?: string;
}
