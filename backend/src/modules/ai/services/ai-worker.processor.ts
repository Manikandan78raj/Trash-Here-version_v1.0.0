import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  AiJobStatus,
  AiRecommendationType,
} from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AiProviderFactory } from '../providers/ai-provider.factory';
import { AiQueueService } from './ai-queue.service';
import { AiGateway } from '../ai.gateway';
import { AiQueueJobPayload } from '../interfaces/ai.interface';

@Injectable()
export class AiWorkerProcessor implements OnModuleInit {
  private readonly logger = new Logger(AiWorkerProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerFactory: AiProviderFactory,
    private readonly queueService: AiQueueService,
    private readonly gateway: AiGateway,
  ) {}

  onModuleInit() {
    this.logger.log(
      'Initializing AI Worker Processor and registering BullMQ consumer loop...',
    );
    this.queueService.processJobs(async (job) => {
      await this.processJob(job);
    });
  }

  async processJob(job: {
    id: string;
    data: AiQueueJobPayload;
  }): Promise<void> {
    const start = Date.now();
    const { id: jobId, data } = job;
    const userId = data.userId || 'anonymous';

    this.logger.debug(
      `[AiWorkerProcessor] Picked up job ${jobId} for image ${data.storageKey} (model: ${data.modelType})`,
    );

    try {
      // 1. Transition status to PROCESSING
      await this.prisma.aiProcessingJob.update({
        where: { jobId },
        data: {
          status: AiJobStatus.PROCESSING,
          startedAt: new Date(),
          attempts: { increment: 1 },
        },
      });

      // 2. Execute computer vision inference via Provider Factory
      const imageUrl = `https://trash-here-ai-storage.s3.amazonaws.com/${data.storageKey}`;
      const detectionResult = await this.providerFactory.executeWithFallback(
        data.modelType,
        imageUrl,
      );

      // 3. Resolve WasteCategory
      const category = await this.prisma.wasteCategory.findFirst({
        where: { name: detectionResult.primaryMaterialCategory },
      });

      // 4. Calculate contamination penalty & green points
      const isContaminated =
        detectionResult.isContaminated ||
        detectionResult.contaminationPercentage > 15.0;

      const co2SavedPerKg = category?.co2SavedPerKg || 2.0;
      const co2SavedKg = Number(
        (detectionResult.estimatedWeightKg * co2SavedPerKg).toFixed(2),
      );

      const pointMult = category?.pointMultiplier || 15;
      let points = Math.floor(detectionResult.estimatedWeightKg * pointMult);

      if (isContaminated) {
        points = Math.floor(points * 0.5); // 50% reward reduction penalty!
        this.logger.warn(
          `[AiWorkerProcessor] Job ${jobId} flagged as CONTAMINATED (${detectionResult.contaminationPercentage}%). Reward points reduced by 50% to ${points}.`,
        );
      }

      const recommendationType = isContaminated
        ? AiRecommendationType.CONTAMINATED_DISPOSE
        : detectionResult.recommendationType;

      // 5. Transactional persistence in PostgreSQL
      const prediction = await this.prisma.$transaction(async (tx) => {
        const dbJob = await tx.aiProcessingJob.findUnique({
          where: { jobId },
        });

        const createdPred = await tx.aiPrediction.create({
          data: {
            jobId: dbJob?.id || jobId,
            imageId: data.imageId,
            primaryCategoryId: category?.id || null,
            isContaminated,
            contaminationRate: detectionResult.contaminationPercentage,
            detectionConfidence:
              detectionResult.detectionConfidence ?? detectionResult.overallConfidence,
            classificationConfidence:
              detectionResult.classificationConfidence ?? detectionResult.overallConfidence,
            recommendationConfidence:
              detectionResult.recommendationConfidence ?? detectionResult.overallConfidence,
            overallConfidence: detectionResult.overallConfidence,
            providerName:
              detectionResult.providerName || detectionResult.modelName || 'mock-vision',
            modelVersion: detectionResult.modelVersion || '1.0.0',
            processingLatencyMs:
              detectionResult.processingTimeMs || Date.now() - start,
            processingCostUsd: detectionResult.processingCostUsd ?? null,
            recommendationType,
            recommendationText: detectionResult.actionableInstructions,
            estimatedWeightKg: detectionResult.estimatedWeightKg,
            co2SavedKg,
            greenPointsEarned: points,
            rawPayload: JSON.stringify(
              detectionResult.rawVendorPayload || {},
            ),
          },
        });

        if (
          detectionResult.detectedObjects &&
          detectionResult.detectedObjects.length > 0
        ) {
          await tx.aiDetectedObject.createMany({
            data: detectionResult.detectedObjects.map((obj) => ({
              predictionId: createdPred.id,
              label: obj.label,
              confidenceScore: obj.confidence,
              xMin: obj.boundingBox.xMin,
              yMin: obj.boundingBox.yMin,
              xMax: obj.boundingBox.xMax,
              yMax: obj.boundingBox.yMax,
              materialType: obj.materialType,
              isContaminant: obj.isContaminant,
            })),
          });
        }

        const durationMs = Date.now() - start;
        await tx.aiProcessingJob.update({
          where: { jobId },
          data: {
            status: AiJobStatus.COMPLETED,
            completedAt: new Date(),
            processingMs: durationMs,
          },
        });

        return createdPred;
      });

      this.logger.log(
        `[AiWorkerProcessor] Successfully completed job ${jobId} in ${Date.now() - start}ms. Prediction ID: ${prediction.id}`,
      );

      // 6. Emit real-time WebSocket notification
      this.gateway.emitPredictionCompleted(userId, {
        jobId,
        predictionId: prediction.id,
      });
    } catch (error: any) {
      this.logger.error(
        `[AiWorkerProcessor] Job ${jobId} failed: ${error?.message}`,
        error?.stack,
      );

      try {
        await this.prisma.aiProcessingJob.update({
          where: { jobId },
          data: {
            status: AiJobStatus.FAILED,
            errorMessage: error?.message || 'Unknown processing failure',
            processingMs: Date.now() - start,
          },
        });
      } catch (dbErr) {
        this.logger.error(
          `[AiWorkerProcessor] Could not update failed status for job ${jobId}`,
        );
      }

      this.gateway.emitJobFailed(
        userId,
        jobId,
        error?.message || 'Processing error',
      );
      throw error; // Re-throw to let queue service handle retry / DLQ
    }
  }
}
