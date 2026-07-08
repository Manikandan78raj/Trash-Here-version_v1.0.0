import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsIn,
  IsOptional,
  IsUUID,
  IsEnum,
  Length,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AiJobStatus, AiModelType, AiRecommendationType } from "@prisma/client";
import { DetectedObjectResult } from "../interfaces/ai.interface";

export class UploadUrlRequestDto {
  @ApiProperty({
    example: "image/jpeg",
    description: "MIME type of the waste image",
    enum: ["image/jpeg", "image/png", "image/webp", "image/heic"],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(["image/jpeg", "image/png", "image/webp", "image/heic"])
  mimeType: string;

  @ApiProperty({
    example: 245760,
    description: "File size in bytes (max 15MB)",
  })
  @IsNumber()
  @Min(1024)
  @Max(15728640)
  fileSizeBytes: number;

  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Optional B2B IncomingLoad ID from Recycler scale intake",
  })
  @IsOptional()
  @IsUUID()
  loadId?: string;
}

export class UploadUrlResponseDto {
  @ApiProperty({
    example:
      "https://trash-here-ai-storage.s3.amazonaws.com/waste/2026-07/img-8812.jpg?signature=...",
    description: "Presigned PUT URL for direct S3/R2 upload",
  })
  presignedUrl: string;

  @ApiProperty({
    example: "waste/2026-07/img-8812.jpg",
    description: "Unique cloud storage key",
  })
  storageKey: string;

  @ApiProperty({
    example: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    description: "Expected SHA-256 cryptographic hash of image bytes",
  })
  sha256Hash: string;

  @ApiProperty({
    example: 900,
    description: "Expiration time of presigned URL in seconds",
  })
  expiresInSeconds: number;
}

export class AnalyzeWasteDto {
  @ApiProperty({
    example: "waste/2026-07/img-8812.jpg",
    description: "Cloud storage key of uploaded image",
  })
  @IsString()
  @IsNotEmpty()
  storageKey: string;

  @ApiProperty({
    example: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    description: "Tamper-proof SHA-256 hash of image",
  })
  @IsString()
  @IsNotEmpty()
  @Length(64, 64)
  sha256Hash: string;

  @ApiProperty({
    example: AiModelType.YOLO_V8,
    enum: AiModelType,
    description: "AI model to use for vision inference",
  })
  @IsEnum(AiModelType)
  modelType: AiModelType;

  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Optional B2B IncomingLoad ID",
  })
  @IsOptional()
  @IsUUID()
  loadId?: string;
}

export class AiJobStatusDto {
  @ApiProperty({ example: "job-redis-88912", description: "BullMQ Job ID" })
  jobId: string;

  @ApiProperty({ example: AiJobStatus.COMPLETED, enum: AiJobStatus })
  status: AiJobStatus;

  @ApiProperty({ example: 1, description: "Number of processing attempts" })
  attempts: number;

  @ApiPropertyOptional({
    example: 450,
    description: "Processing duration in ms",
  })
  processingMs?: number;

  @ApiPropertyOptional({
    example: "Model timeout",
    description: "Error message if failed",
  })
  errorMessage?: string;
}

export class AiPredictionResponseDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @ApiProperty({ example: "job-redis-88912" })
  jobId: string;

  @ApiProperty({ example: "waste/2026-07/img-8812.jpg" })
  storageKey: string;

  @ApiProperty({ example: "Plastic PET" })
  primaryCategoryName: string;

  @ApiProperty({ example: false })
  isContaminated: boolean;

  @ApiProperty({
    example: 2.5,
    description: "Contamination percentage by weight",
  })
  contaminationRate: number;

  @ApiProperty({ example: 0.94, description: "Overall model confidence score" })
  overallConfidence: number;

  @ApiProperty({
    example: AiRecommendationType.DIRECT_RECYCLE,
    enum: AiRecommendationType,
  })
  recommendationType: AiRecommendationType;

  @ApiProperty({
    example: "Clean PET bottle detected. Ready for direct recycling.",
  })
  recommendationText: string;

  @ApiProperty({ example: 0.45, description: "Estimated waste weight in kg" })
  estimatedWeightKg: number;

  @ApiProperty({ example: 1.12, description: "Estimated kg of CO2 offset" })
  co2SavedKg: number;

  @ApiProperty({ example: 15, description: "Green points earned" })
  greenPointsEarned: number;

  @ApiProperty({
    description: "Array of detected object bounding boxes and labels",
  })
  detectedObjects: DetectedObjectResult[];

  @ApiProperty({ example: "2026-07-07T04:00:00.000Z" })
  createdAt: Date;
}

export class ModelHealthDto {
  @ApiProperty({ example: "yolov8-waste-v2.4" })
  modelName: string;

  @ApiProperty({ example: true })
  isHealthy: boolean;

  @ApiProperty({ example: 120, description: "Average inference latency in ms" })
  latencyMs: number;

  @ApiProperty({ example: "2.4.0" })
  modelVersion: string;
}
