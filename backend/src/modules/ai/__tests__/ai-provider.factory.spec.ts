import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiModelType, AiRecommendationType } from '@prisma/client';
import { AiProviderFactory } from '../providers/ai-provider.factory';
import { MockVisionProvider } from '../providers/mock-vision.provider';
import { YoloVisionProvider } from '../providers/yolo-vision.provider';
import { OpenAiVisionProvider } from '../providers/openai-vision.provider';
import { GeminiVisionProvider } from '../providers/gemini-vision.provider';
import { HybridVisionProvider } from '../providers/hybrid-vision.provider';

describe('AiProviderFactory & Vision Providers (TDD)', () => {
  let factory: AiProviderFactory;
  let mockProvider: MockVisionProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiProviderFactory,
        MockVisionProvider,
        YoloVisionProvider,
        OpenAiVisionProvider,
        GeminiVisionProvider,
        HybridVisionProvider,
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    factory = module.get<AiProviderFactory>(AiProviderFactory);
    mockProvider = module.get<MockVisionProvider>(MockVisionProvider);
  });

  describe('MockVisionProvider', () => {
    it('should return clean PET bottle detection for standard images', async () => {
      const result = await mockProvider.detectWaste(
        'https://storage.trashhere.com/clean-bottle.jpg',
      );

      expect(result.modelName).toBe('mock-vision-v1');
      expect(result.overallConfidence).toBeGreaterThanOrEqual(0.9);
      expect(result.primaryMaterialCategory).toBe('Plastic PET');
      expect(result.isContaminated).toBe(false);
      expect(result.contaminationPercentage).toBe(0.0);
      expect(result.recommendationType).toBe(
        AiRecommendationType.DIRECT_RECYCLE,
      );
      expect(result.detectedObjects.length).toBeGreaterThan(0);
      expect(result.detectedObjects[0].label).toBe('PET_BOTTLE');
      expect(result.detectedObjects[0].boundingBox).toEqual({
        xMin: 0.15,
        yMin: 0.2,
        xMax: 0.85,
        yMax: 0.9,
      });
    });

    it('should detect contamination when URL contains "contaminated" or "pizza"', async () => {
      const result = await mockProvider.detectWaste(
        'https://storage.trashhere.com/contaminated-pizza-box.jpg',
      );

      expect(result.isContaminated).toBe(true);
      expect(result.contaminationPercentage).toBeGreaterThanOrEqual(20.0);
      expect(result.recommendationType).toBe(
        AiRecommendationType.CONTAMINATED_DISPOSE,
      );
      const contaminant = result.detectedObjects.find(
        (o) => o.isContaminant === true,
      );
      expect(contaminant).toBeDefined();
      expect(contaminant?.label).toBe('FOOD_WASTE_CONTAMINANT');
    });

    it('should return healthy status on getHealth()', async () => {
      const health = await mockProvider.getHealth();
      expect(health.isHealthy).toBe(true);
      expect(health.modelVersion).toBe('mock-vision-v1');
      expect(health.latencyMs).toBeLessThan(50);
    });
  });

  describe('AiProviderFactory Resolution', () => {
    it('should resolve MockVisionProvider when MOCK_VISION requested', () => {
      const provider = factory.getProvider(AiModelType.MOCK_VISION);
      expect(provider).toBeInstanceOf(MockVisionProvider);
    });

    it('should resolve YoloVisionProvider when YOLO_V8 requested', () => {
      const provider = factory.getProvider(AiModelType.YOLO_V8);
      expect(provider).toBeInstanceOf(YoloVisionProvider);
    });

    it('should resolve OpenAiVisionProvider when OPENAI_GPT4O_VISION requested', () => {
      const provider = factory.getProvider(AiModelType.OPENAI_GPT4O_VISION);
      expect(provider).toBeInstanceOf(OpenAiVisionProvider);
    });

    it('should resolve GeminiVisionProvider when GEMINI_1_5_PRO_VISION requested', () => {
      const provider = factory.getProvider(AiModelType.GEMINI_1_5_PRO_VISION);
      expect(provider).toBeInstanceOf(GeminiVisionProvider);
    });

    it('should default to MockVisionProvider if an unknown model type is passed', () => {
      const provider = factory.getProvider('UNKNOWN_MODEL' as AiModelType);
      expect(provider).toBeInstanceOf(MockVisionProvider);
    });
  });

  describe('executeWithFallback() Resiliency', () => {
    it('should execute primary provider successfully when healthy', async () => {
      const yoloProvider = factory.getProvider(AiModelType.YOLO_V8);
      jest.spyOn(yoloProvider, 'detectWaste').mockResolvedValueOnce({
        modelName: 'yolov8-waste-v2.4',
        processingTimeMs: 110,
        overallConfidence: 0.94,
        primaryMaterialCategory: 'Metal Aluminum',
        isContaminated: false,
        contaminationPercentage: 0.0,
        recommendationType: AiRecommendationType.DIRECT_RECYCLE,
        actionableInstructions: 'Crush aluminum can and recycle.',
        estimatedWeightKg: 0.05,
        co2SavedKg: 0.45,
        greenPointsEarned: 10,
        detectedObjects: [],
      });

      const result = await factory.executeWithFallback(
        AiModelType.YOLO_V8,
        'https://storage.trashhere.com/can.jpg',
      );

      expect(result.modelName).toBe('yolov8-waste-v2.4');
      expect(result.primaryMaterialCategory).toBe('Metal Aluminum');
    });

    it('should fall back to MockVisionProvider when primary provider throws an error', async () => {
      const openAiProvider = factory.getProvider(
        AiModelType.OPENAI_GPT4O_VISION,
      );
      jest
        .spyOn(openAiProvider, 'detectWaste')
        .mockRejectedValueOnce(new Error('OpenAI API Rate Limit Exceeded 429'));

      const result = await factory.executeWithFallback(
        AiModelType.OPENAI_GPT4O_VISION,
        'https://storage.trashhere.com/clean-bottle.jpg',
      );

      // Should automatically fallback to mock vision provider!
      expect(result.modelName).toBe('mock-vision-v1');
      expect(result.overallConfidence).toBeGreaterThan(0.8);
    });
  });
});
