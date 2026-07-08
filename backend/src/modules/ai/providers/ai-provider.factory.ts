import { Injectable, Logger } from "@nestjs/common";
import { AiModelType } from "@prisma/client";
import {
  IAiDetectionProvider,
  AiDetectionResponse,
} from "../interfaces/ai.interface";
import { MockVisionProvider } from "./mock-vision.provider";
import { YoloVisionProvider } from "./yolo-vision.provider";
import { OpenAiVisionProvider } from "./openai-vision.provider";
import { GeminiVisionProvider } from "./gemini-vision.provider";
import { HybridVisionProvider } from "./hybrid-vision.provider";

@Injectable()
export class AiProviderFactory {
  private readonly logger = new Logger(AiProviderFactory.name);

  constructor(
    private readonly mockProvider: MockVisionProvider,
    private readonly yoloProvider: YoloVisionProvider,
    private readonly openAiProvider: OpenAiVisionProvider,
    private readonly geminiProvider: GeminiVisionProvider,
    private readonly hybridProvider: HybridVisionProvider,
  ) {}

  getProvider(modelType: AiModelType): IAiDetectionProvider {
    switch (modelType) {
      case AiModelType.HYBRID_VISION:
        return this.hybridProvider;
      case AiModelType.YOLO_V8:
        return this.yoloProvider;
      case AiModelType.OPENAI_GPT4O_VISION:
        return this.openAiProvider;
      case AiModelType.GEMINI_1_5_PRO_VISION:
        return this.geminiProvider;
      case AiModelType.MOCK_VISION:
      case AiModelType.CUSTOM_RESNET:
      default:
        return this.mockProvider;
    }
  }

  async executeWithFallback(
    modelType: AiModelType,
    imageUrl: string,
    options?: { minConfidence?: number; maxObjects?: number },
  ): Promise<AiDetectionResponse> {
    const primaryProvider = this.getProvider(modelType);

    try {
      this.logger.debug(
        `[AiProviderFactory] Executing primary vision provider for model: ${modelType}`,
      );
      return await primaryProvider.detectWaste(imageUrl, options);
    } catch (error: any) {
      this.logger.warn(
        `[AiProviderFactory] Primary provider ${modelType} failed (${error?.message}). Falling back to MockVisionProvider resiliency layer.`,
      );
      return await this.mockProvider.detectWaste(imageUrl, options);
    }
  }
}
