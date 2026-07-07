import { Injectable, Logger } from '@nestjs/common';
import { AiRecommendationType } from '@prisma/client';
import {
  IAiDetectionProvider,
  AiDetectionResponse,
} from '../interfaces/ai.interface';

@Injectable()
export class MockVisionProvider implements IAiDetectionProvider {
  private readonly logger = new Logger(MockVisionProvider.name);

  async detectWaste(
    imageUrl: string,
    options?: { minConfidence?: number; maxObjects?: number },
  ): Promise<AiDetectionResponse> {
    this.logger.debug(
      `[MockVisionProvider] Executing deterministic vision inference for URL: ${imageUrl}`,
    );

    const isContaminatedUrl =
      imageUrl.toLowerCase().includes('contaminated') ||
      imageUrl.toLowerCase().includes('pizza') ||
      imageUrl.toLowerCase().includes('grease') ||
      imageUrl.toLowerCase().includes('hazard');

    if (isContaminatedUrl) {
      return {
        modelName: 'mock-vision-v1',
        processingTimeMs: 15,
        overallConfidence: 0.92,
        primaryMaterialCategory: 'Paper Cardboard',
        isContaminated: true,
        contaminationPercentage: 25.0,
        recommendationType: AiRecommendationType.CONTAMINATED_DISPOSE,
        actionableInstructions:
          'Grease and food residue detected on cardboard. Do not place in recycling bin; dispose in standard waste or industrial composting.',
        estimatedWeightKg: 0.6,
        co2SavedKg: 0.0,
        greenPointsEarned: 5,
        detectedObjects: [
          {
            label: 'CARDBOARD_BOX',
            confidence: 0.94,
            boundingBox: { xMin: 0.05, yMin: 0.05, xMax: 0.95, yMax: 0.95 },
            materialType: 'PAPER_CARDBOARD',
            isContaminant: false,
          },
          {
            label: 'FOOD_WASTE_CONTAMINANT',
            confidence: 0.89,
            boundingBox: { xMin: 0.3, yMin: 0.3, xMax: 0.7, yMax: 0.7 },
            materialType: 'ORGANIC',
            isContaminant: true,
          },
        ],
        rawVendorPayload: { mock: true, contaminated: true },
      };
    }

    // Default clean PET bottle detection
    return {
      modelName: 'mock-vision-v1',
      processingTimeMs: 12,
      overallConfidence: 0.96,
      primaryMaterialCategory: 'Plastic PET',
      isContaminated: false,
      contaminationPercentage: 0.0,
      recommendationType: AiRecommendationType.DIRECT_RECYCLE,
      actionableInstructions:
        'Clean PET bottle detected. Rinse lightly and place in blue commingled recycling container.',
      estimatedWeightKg: 0.45,
      co2SavedKg: 1.12,
      greenPointsEarned: 15,
      detectedObjects: [
        {
          label: 'PET_BOTTLE',
          confidence: 0.97,
          boundingBox: { xMin: 0.15, yMin: 0.2, xMax: 0.85, yMax: 0.9 },
          materialType: 'PLASTIC_PET',
          isContaminant: false,
        },
      ],
      rawVendorPayload: { mock: true, contaminated: false },
    };
  }

  async getHealth(): Promise<{
    isHealthy: boolean;
    modelVersion: string;
    latencyMs: number;
  }> {
    return {
      isHealthy: true,
      modelVersion: 'mock-vision-v1',
      latencyMs: 12,
    };
  }
}
