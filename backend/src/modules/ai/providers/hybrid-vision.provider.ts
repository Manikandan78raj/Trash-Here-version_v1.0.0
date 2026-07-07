import { Injectable, Logger } from '@nestjs/common';
import { AiRecommendationType } from '@prisma/client';
import {
  IAiDetectionProvider,
  AiDetectionResponse,
} from '../interfaces/ai.interface';
import { YoloVisionProvider } from './yolo-vision.provider';
import { OpenAiVisionProvider } from './openai-vision.provider';
import { GeminiVisionProvider } from './gemini-vision.provider';

@Injectable()
export class HybridVisionProvider implements IAiDetectionProvider {
  private readonly logger = new Logger(HybridVisionProvider.name);

  constructor(
    private readonly yoloProvider: YoloVisionProvider,
    private readonly openAiProvider: OpenAiVisionProvider,
    private readonly geminiProvider: GeminiVisionProvider,
  ) {}

  async detectWaste(
    imageUrl: string,
    options?: { minConfidence?: number; maxObjects?: number },
  ): Promise<AiDetectionResponse> {
    const startTime = Date.now();
    this.logger.log(`Executing Hybrid Vision pipeline for image: ${imageUrl}`);

    try {
      // Execute fast localization (YOLOv8) and deep reasoning (OpenAI GPT-4o / Gemini) in parallel
      const [yoloRes, reasoningRes] = await Promise.all([
        this.yoloProvider.detectWaste(imageUrl, options).catch((err) => {
          this.logger.warn(`YOLO localization failed in hybrid pipeline: ${err.message}`);
          return null;
        }),
        this.openAiProvider.detectWaste(imageUrl, options).catch(async (err) => {
          this.logger.warn(
            `OpenAI reasoning failed in hybrid pipeline, falling back to Gemini: ${err.message}`,
          );
          return this.geminiProvider.detectWaste(imageUrl, options).catch((geminiErr) => {
            this.logger.warn(`Gemini fallback also failed: ${geminiErr.message}`);
            return null;
          });
        }),
      ]);

      const processingTimeMs = Date.now() - startTime;

      if (!reasoningRes && !yoloRes) {
        throw new Error('Both localization and reasoning providers failed in hybrid pipeline');
      }

      // If reasoning failed but YOLO succeeded
      if (!reasoningRes && yoloRes) {
        return {
          ...yoloRes,
          modelName: 'hybrid-vision-yolo-only',
          providerName: 'hybrid-vision',
          modelVersion: '2.0.0-hybrid',
          detectionConfidence: yoloRes.overallConfidence,
          classificationConfidence: yoloRes.overallConfidence * 0.9,
          recommendationConfidence: 0.85,
          processingCostUsd: 0.0,
          processingTimeMs,
        };
      }

      // If YOLO failed but reasoning succeeded
      if (!yoloRes && reasoningRes) {
        return {
          ...reasoningRes,
          modelName: 'hybrid-vision-gpt4o-only',
          providerName: 'hybrid-vision',
          modelVersion: '2.0.0-hybrid',
          detectionConfidence: reasoningRes.overallConfidence * 0.85,
          classificationConfidence: reasoningRes.overallConfidence,
          recommendationConfidence: reasoningRes.overallConfidence,
          processingCostUsd: 0.005,
          processingTimeMs,
        };
      }

      // Both succeeded: synthesize high-precision localization with deep reasoning
      const detectionConfidence = yoloRes!.overallConfidence;
      const classificationConfidence = reasoningRes!.overallConfidence;
      const recommendationConfidence = reasoningRes!.overallConfidence;
      const overallConfidence = Number(
        (detectionConfidence * 0.4 + classificationConfidence * 0.6).toFixed(2),
      );

      // Merge detected objects: prioritize YOLO bounding boxes, enrich with reasoning material types
      const mergedObjects = yoloRes!.detectedObjects.map((obj, index) => {
        const reasoningObj = reasoningRes!.detectedObjects[index] || reasoningRes!.detectedObjects[0];
        return {
          ...obj,
          materialType: reasoningObj ? reasoningObj.materialType : obj.materialType,
          isContaminant: reasoningObj ? reasoningObj.isContaminant : obj.isContaminant,
        };
      });

      return {
        modelName: 'hybrid-vision-yolo-gpt4o',
        providerName: 'hybrid-vision',
        modelVersion: '2.0.0-hybrid',
        processingTimeMs,
        overallConfidence,
        detectionConfidence,
        classificationConfidence,
        recommendationConfidence,
        processingCostUsd: 0.005,
        primaryMaterialCategory: reasoningRes!.primaryMaterialCategory,
        isContaminated: reasoningRes!.isContaminated || yoloRes!.isContaminated,
        contaminationPercentage: Math.max(
          reasoningRes!.contaminationPercentage,
          yoloRes!.contaminationPercentage,
        ),
        recommendationType: reasoningRes!.recommendationType,
        actionableInstructions: reasoningRes!.actionableInstructions,
        estimatedWeightKg: reasoningRes!.estimatedWeightKg,
        co2SavedKg: reasoningRes!.co2SavedKg,
        greenPointsEarned: reasoningRes!.greenPointsEarned,
        detectedObjects: mergedObjects.length > 0 ? mergedObjects : reasoningRes!.detectedObjects,
        rawVendorPayload: {
          yolo: yoloRes!.rawVendorPayload,
          reasoning: reasoningRes!.rawVendorPayload,
        },
      };
    } catch (error: any) {
      this.logger.error(`Hybrid vision pipeline error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getHealth(): Promise<{
    isHealthy: boolean;
    modelVersion: string;
    latencyMs: number;
  }> {
    const startTime = Date.now();
    try {
      const [yoloHealth, openAiHealth] = await Promise.all([
        this.yoloProvider.getHealth().catch(() => ({ isHealthy: false })),
        this.openAiProvider.getHealth().catch(() => ({ isHealthy: false })),
      ]);

      const isHealthy = yoloHealth.isHealthy || openAiHealth.isHealthy;
      return {
        isHealthy,
        modelVersion: '2.0.0-hybrid',
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        isHealthy: false,
        modelVersion: '2.0.0-hybrid',
        latencyMs: Date.now() - startTime,
      };
    }
  }
}
