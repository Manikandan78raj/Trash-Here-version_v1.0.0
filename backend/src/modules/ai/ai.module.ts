import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { AiController } from "./ai.controller";
import { AiGateway } from "./ai.gateway";
import { AiEngineService } from "./services/ai-engine.service";
import { AiStorageService } from "./services/ai-storage.service";
import { AiQueueService } from "./services/ai-queue.service";
import { AiWorkerProcessor } from "./services/ai-worker.processor";
import { AiProviderFactory } from "./providers/ai-provider.factory";
import { MockVisionProvider } from "./providers/mock-vision.provider";
import { YoloVisionProvider } from "./providers/yolo-vision.provider";
import { OpenAiVisionProvider } from "./providers/openai-vision.provider";
import { GeminiVisionProvider } from "./providers/gemini-vision.provider";
import { HybridVisionProvider } from "./providers/hybrid-vision.provider";

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AiController],
  providers: [
    AiEngineService,
    AiStorageService,
    AiQueueService,
    AiWorkerProcessor,
    AiProviderFactory,
    MockVisionProvider,
    YoloVisionProvider,
    OpenAiVisionProvider,
    GeminiVisionProvider,
    HybridVisionProvider,
    AiGateway,
  ],
  exports: [
    AiEngineService,
    AiStorageService,
    AiQueueService,
    AiProviderFactory,
  ],
})
export class AiModule {}
