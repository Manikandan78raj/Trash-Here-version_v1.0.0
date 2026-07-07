import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  AiJobStatus,
  AiModelType,
  AiRecommendationType,
} from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AiStorageService } from './ai-storage.service';
import { AiQueueService } from './ai-queue.service';
import { AiProviderFactory } from '../providers/ai-provider.factory';
import {
  AnalyzeWasteDto,
  UploadUrlRequestDto,
  UploadUrlResponseDto,
  AiJobStatusDto,
  AiPredictionResponseDto,
  ModelHealthDto,
} from '../dto/ai.dto';
import { AiQueueJobPayload } from '../interfaces/ai.interface';

@Injectable()
export class AiEngineService {
  private readonly logger = new Logger(AiEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: AiStorageService,
    private readonly queueService: AiQueueService,
    private readonly providerFactory: AiProviderFactory,
  ) {}

  async createUploadUrl(
    userId: string,
    dto: UploadUrlRequestDto,
  ): Promise<UploadUrlResponseDto> {
    return this.storageService.generatePresignedUploadUrl(userId, dto);
  }

  async submitForAnalysis(
    userId: string,
    dto: AnalyzeWasteDto,
  ): Promise<{ jobId: string; status: AiJobStatus; message: string }> {
    const isValid = await this.storageService.verifyStorageObject(
      dto.storageKey,
      dto.sha256Hash,
    );

    if (!isValid) {
      throw new BadRequestException(
        'Invalid storage key or SHA-256 hash mismatch. File verification failed.',
      );
    }

    const fileUrl = `https://trash-here-ai-storage.s3.amazonaws.com/${dto.storageKey}`;

    // Create persistent storage reference
    const imageUpload = await this.prisma.aiImageUpload.create({
      data: {
        userId,
        loadId: dto.loadId || null,
        fileUrl,
        storageKey: dto.storageKey,
        sha256Hash: dto.sha256Hash,
        fileSizeBytes: 524288, // Estimated or retrieved from S3 metadata
        mimeType: 'image/jpeg',
      },
    });

    const uniqueJobId = `job-redis-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Create queue tracking record
    const processingJob = await this.prisma.aiProcessingJob.create({
      data: {
        jobId: uniqueJobId,
        imageId: imageUpload.id,
        status: AiJobStatus.QUEUED,
      },
    });

    const queuePayload: AiQueueJobPayload = {
      jobId: uniqueJobId,
      imageId: imageUpload.id,
      storageKey: dto.storageKey,
      sha256Hash: dto.sha256Hash,
      modelType: dto.modelType || AiModelType.YOLO_V8,
      userId,
      loadId: dto.loadId,
    };

    // Enqueue asynchronously to BullMQ
    await this.queueService.addJob('analyze-waste', queuePayload);

    this.logger.log(
      `[AiEngineService] Job ${uniqueJobId} enqueued for user ${userId} using model ${dto.modelType}`,
    );

    return {
      jobId: processingJob.jobId,
      status: processingJob.status,
      message: 'Job accepted for asynchronous computer vision processing.',
    };
  }

  async getJobStatus(jobId: string): Promise<AiJobStatusDto> {
    const job = await this.prisma.aiProcessingJob.findUnique({
      where: { jobId },
    });

    if (!job) {
      throw new NotFoundException(`AI processing job ${jobId} not found`);
    }

    return {
      jobId: job.jobId,
      status: job.status,
      attempts: job.attempts,
      processingMs: job.processingMs || undefined,
      errorMessage: job.errorMessage || undefined,
    };
  }

  async getPredictionByJobId(jobId: string): Promise<AiPredictionResponseDto> {
    const prediction = await this.prisma.aiPrediction.findFirst({
      where: { job: { jobId } },
      include: {
        detectedObjects: true,
        primaryCategory: true,
        image: true,
      },
    });

    if (!prediction) {
      throw new NotFoundException(
        `Prediction for job ${jobId} not found or still processing`,
      );
    }

    return {
      id: prediction.id,
      jobId,
      storageKey: prediction.image?.storageKey || 'unknown',
      primaryCategoryName:
        prediction.primaryCategory?.name || 'Unclassified Commingled',
      isContaminated: prediction.isContaminated,
      contaminationRate: prediction.contaminationRate,
      overallConfidence: prediction.overallConfidence,
      recommendationType: prediction.recommendationType,
      recommendationText: prediction.recommendationText,
      estimatedWeightKg: prediction.estimatedWeightKg,
      co2SavedKg: prediction.co2SavedKg,
      greenPointsEarned: prediction.greenPointsEarned,
      detectedObjects: prediction.detectedObjects.map((obj) => ({
        label: obj.label,
        confidence: obj.confidenceScore,
        boundingBox: {
          xMin: obj.xMin,
          yMin: obj.yMin,
          xMax: obj.xMax,
          yMax: obj.yMax,
        },
        materialType: obj.materialType,
        isContaminant: obj.isContaminant,
      })),
      createdAt: prediction.createdAt,
    };
  }

  async getModelHealth(): Promise<ModelHealthDto[]> {
    const models = [
      AiModelType.YOLO_V8,
      AiModelType.OPENAI_GPT4O_VISION,
      AiModelType.GEMINI_1_5_PRO_VISION,
      AiModelType.MOCK_VISION,
    ];

    const healthPromises = models.map(async (modelType) => {
      const provider = this.providerFactory.getProvider(modelType);
      const health = await provider.getHealth();
      return {
        modelName:
          modelType === AiModelType.YOLO_V8
            ? 'yolov8-waste-v2.4'
            : modelType === AiModelType.OPENAI_GPT4O_VISION
              ? 'gpt-4o-vision'
              : modelType === AiModelType.GEMINI_1_5_PRO_VISION
                ? 'gemini-1.5-pro'
                : 'mock-vision',
        isHealthy: health.isHealthy,
        latencyMs: health.latencyMs,
        modelVersion: health.modelVersion,
      };
    });

    return Promise.all(healthPromises);
  }
}
