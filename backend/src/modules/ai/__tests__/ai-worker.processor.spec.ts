import { Test, TestingModule } from "@nestjs/testing";
import { AiJobStatus, AiModelType, AiRecommendationType } from "@prisma/client";
import { AiWorkerProcessor } from "../services/ai-worker.processor";
import { AiProviderFactory } from "../providers/ai-provider.factory";
import { AiQueueService } from "../services/ai-queue.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { AiGateway } from "../ai.gateway";
import {
  AiDetectionResponse,
  AiQueueJobPayload,
} from "../interfaces/ai.interface";

describe("AiWorkerProcessor (TDD)", () => {
  let processor: AiWorkerProcessor;
  let factory: AiProviderFactory;
  let prisma: PrismaService;
  let gateway: AiGateway;
  let queueService: AiQueueService;

  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    aiProcessingJob: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    wasteCategory: {
      findFirst: jest.fn(),
    },
    aiPrediction: {
      create: jest.fn(),
    },
    aiDetectedObject: {
      createMany: jest.fn(),
    },
  };

  const mockFactory = {
    executeWithFallback: jest.fn(),
  };

  const mockGateway = {
    emitPredictionCompleted: jest.fn(),
    emitJobFailed: jest.fn(),
  };

  const mockQueueService = {
    processJobs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiWorkerProcessor,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AiProviderFactory, useValue: mockFactory },
        { provide: AiGateway, useValue: mockGateway },
        { provide: AiQueueService, useValue: mockQueueService },
      ],
    }).compile();

    processor = module.get<AiWorkerProcessor>(AiWorkerProcessor);
    factory = module.get<AiProviderFactory>(AiProviderFactory);
    prisma = module.get<PrismaService>(PrismaService);
    gateway = module.get<AiGateway>(AiGateway);
    queueService = module.get<AiQueueService>(AiQueueService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("processJob() Lifecycle", () => {
    const samplePayload: AiQueueJobPayload = {
      jobId: "bullmq-job-200",
      imageId: "image-uuid-1",
      storageKey: "waste/2026-07/clean-bottle.jpg",
      sha256Hash:
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      modelType: AiModelType.YOLO_V8,
      userId: "user-1",
    };

    it("should process job, calculate rewards/CO2, save to database, and emit websocket event", async () => {
      const mockDetectionResult: AiDetectionResponse = {
        modelName: "yolov8-waste-v2.4",
        processingTimeMs: 120,
        overallConfidence: 0.95,
        primaryMaterialCategory: "Plastic PET",
        isContaminated: false,
        contaminationPercentage: 0.0,
        recommendationType: AiRecommendationType.DIRECT_RECYCLE,
        actionableInstructions: "Rinse and recycle in blue bin.",
        estimatedWeightKg: 0.4,
        co2SavedKg: 0.0, // Will be calculated by processor
        greenPointsEarned: 0, // Will be calculated by processor
        detectedObjects: [
          {
            label: "PET_BOTTLE",
            confidence: 0.96,
            boundingBox: { xMin: 0.1, yMin: 0.1, xMax: 0.9, yMax: 0.9 },
            materialType: "PLASTIC_PET",
            isContaminant: false,
          },
        ],
      };

      mockFactory.executeWithFallback.mockResolvedValueOnce(
        mockDetectionResult,
      );
      mockPrismaService.wasteCategory.findFirst.mockResolvedValueOnce({
        id: "cat-pet-uuid",
        name: "Plastic PET",
        pointMultiplier: 20, // 20 points per kg
        co2SavedPerKg: 2.5, // 2.5 kg CO2 per kg
      });
      mockPrismaService.aiPrediction.create.mockResolvedValueOnce({
        id: "pred-uuid-100",
        jobId: "job-db-uuid-100",
      });

      await processor.processJob({
        id: "bullmq-job-200",
        data: samplePayload,
      });

      // 1. Check status update to PROCESSING
      expect(mockPrismaService.aiProcessingJob.update).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: { jobId: "bullmq-job-200" },
          data: expect.objectContaining({ status: AiJobStatus.PROCESSING }),
        }),
      );

      // 2. Check provider execution
      expect(mockFactory.executeWithFallback).toHaveBeenCalledWith(
        AiModelType.YOLO_V8,
        expect.stringContaining("waste/2026-07/clean-bottle.jpg"),
      );

      // 3. Check reward calculation (0.4 kg * 20 mult = 8 points, CO2 = 0.4 * 2.5 = 1.0 kg)
      expect(mockPrismaService.aiPrediction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            greenPointsEarned: 8,
            co2SavedKg: 1.0,
            primaryCategoryId: "cat-pet-uuid",
          }),
        }),
      );

      // 4. Check status update to COMPLETED
      expect(mockPrismaService.aiProcessingJob.update).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          where: { jobId: "bullmq-job-200" },
          data: expect.objectContaining({ status: AiJobStatus.COMPLETED }),
        }),
      );

      // 5. Check WebSocket event emission
      expect(mockGateway.emitPredictionCompleted).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          jobId: "bullmq-job-200",
          predictionId: "pred-uuid-100",
        }),
      );
    });

    it("should apply 50% reward penalty if contamination percentage is over 15%", async () => {
      const mockContaminatedResult: AiDetectionResponse = {
        modelName: "gpt-4o-vision",
        processingTimeMs: 800,
        overallConfidence: 0.91,
        primaryMaterialCategory: "Paper Cardboard",
        isContaminated: true,
        contaminationPercentage: 25.0, // Over 15% threshold!
        recommendationType: AiRecommendationType.CONTAMINATED_DISPOSE,
        actionableInstructions: "Grease contaminated pizza box. Dispose.",
        estimatedWeightKg: 1.0,
        co2SavedKg: 0.0,
        greenPointsEarned: 0,
        detectedObjects: [],
      };

      mockFactory.executeWithFallback.mockResolvedValueOnce(
        mockContaminatedResult,
      );
      mockPrismaService.wasteCategory.findFirst.mockResolvedValueOnce({
        id: "cat-cardboard-uuid",
        name: "Paper Cardboard",
        pointMultiplier: 10, // Normally 1.0 kg * 10 = 10 points
        co2SavedPerKg: 1.5,
      });
      mockPrismaService.aiPrediction.create.mockResolvedValueOnce({
        id: "pred-uuid-101",
      });

      await processor.processJob({
        id: "bullmq-job-201",
        data: { ...samplePayload, jobId: "bullmq-job-201" },
      });

      // 50% penalty applied: 10 points -> 5 points!
      expect(mockPrismaService.aiPrediction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            greenPointsEarned: 5,
            isContaminated: true,
          }),
        }),
      );
    });

    it("should handle errors, update status to FAILED, and emit failure event", async () => {
      mockFactory.executeWithFallback.mockRejectedValueOnce(
        new Error("Fatal GPU Out Of Memory"),
      );

      await expect(
        processor.processJob({ id: "bullmq-job-500", data: samplePayload }),
      ).rejects.toThrow("Fatal GPU Out Of Memory");

      expect(mockPrismaService.aiProcessingJob.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { jobId: "bullmq-job-500" },
          data: expect.objectContaining({
            status: AiJobStatus.FAILED,
            errorMessage: "Fatal GPU Out Of Memory",
          }),
        }),
      );

      expect(mockGateway.emitJobFailed).toHaveBeenCalledWith(
        "user-1",
        "bullmq-job-500",
        "Fatal GPU Out Of Memory",
      );
    });
  });
});
