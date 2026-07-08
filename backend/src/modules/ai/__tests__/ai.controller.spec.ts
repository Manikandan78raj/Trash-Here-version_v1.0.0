import { Test, TestingModule } from "@nestjs/testing";
import { AiJobStatus, AiModelType, AiRecommendationType } from "@prisma/client";
import { AiController } from "../ai.controller";
import { AiEngineService } from "../services/ai-engine.service";
import { AnalyzeWasteDto, UploadUrlRequestDto } from "../dto/ai.dto";

describe("AiController (TDD)", () => {
  let controller: AiController;
  let service: AiEngineService;

  const mockAiEngineService = {
    createUploadUrl: jest.fn(),
    submitForAnalysis: jest.fn(),
    getJobStatus: jest.fn(),
    getPredictionByJobId: jest.fn(),
    getModelHealth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiEngineService, useValue: mockAiEngineService }],
    }).compile();

    controller = module.get<AiController>(AiController);
    service = module.get<AiEngineService>(AiEngineService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /ai/upload-url", () => {
    it("should return presigned URL and storage key", async () => {
      const dto: UploadUrlRequestDto = {
        mimeType: "image/jpeg",
        fileSizeBytes: 204800,
      };

      const mockResponse = {
        presignedUrl: "https://s3.amazonaws.com/upload?sig=abc",
        storageKey: "waste/2026-07/img-88.jpg",
        sha256Hash: "e3b0c442...",
        expiresInSeconds: 900,
      };

      mockAiEngineService.createUploadUrl.mockResolvedValueOnce(mockResponse);

      const req: any = { user: { userId: "user-uuid-1" } };
      const result = await controller.requestUploadUrl(req, dto);

      expect(result).toEqual(mockResponse);
      expect(mockAiEngineService.createUploadUrl).toHaveBeenCalledWith(
        "user-uuid-1",
        dto,
      );
    });
  });

  describe("POST /ai/analyze", () => {
    it("should submit waste image for AI analysis and return job ID", async () => {
      const dto: AnalyzeWasteDto = {
        storageKey: "waste/2026-07/img-88.jpg",
        sha256Hash:
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        modelType: AiModelType.YOLO_V8,
      };

      const mockResponse = {
        jobId: "bullmq-job-88",
        status: AiJobStatus.QUEUED,
        message: "Job accepted for processing",
      };

      mockAiEngineService.submitForAnalysis.mockResolvedValueOnce(mockResponse);

      const req: any = { user: { userId: "user-uuid-1" } };
      const result = await controller.analyzeWaste(req, dto);

      expect(result).toEqual(mockResponse);
      expect(mockAiEngineService.submitForAnalysis).toHaveBeenCalledWith(
        "user-uuid-1",
        dto,
      );
    });
  });

  describe("GET /ai/jobs/:jobId", () => {
    it("should return status of processing job", async () => {
      const mockStatus = {
        jobId: "bullmq-job-88",
        status: AiJobStatus.COMPLETED,
        attempts: 1,
        processingMs: 340,
      };

      mockAiEngineService.getJobStatus.mockResolvedValueOnce(mockStatus);

      const result = await controller.getJobStatus("bullmq-job-88");
      expect(result).toEqual(mockStatus);
    });
  });

  describe("GET /ai/predictions/:jobId", () => {
    it("should return completed prediction details", async () => {
      const mockPrediction = {
        id: "pred-88",
        jobId: "bullmq-job-88",
        primaryCategoryName: "Plastic PET",
        isContaminated: false,
        greenPointsEarned: 15,
        detectedObjects: [],
      };

      mockAiEngineService.getPredictionByJobId.mockResolvedValueOnce(
        mockPrediction,
      );

      const result = await controller.getPrediction("bullmq-job-88");
      expect(result).toEqual(mockPrediction);
    });
  });

  describe("GET /ai/models/health", () => {
    it("should return health metrics across AI vision providers", async () => {
      const mockHealth = [
        {
          modelName: "yolov8-waste-v2.4",
          isHealthy: true,
          latencyMs: 120,
          modelVersion: "2.4.0",
        },
      ];

      mockAiEngineService.getModelHealth.mockResolvedValueOnce(mockHealth);

      const result = await controller.getModelsHealth();
      expect(result).toEqual(mockHealth);
    });
  });
});
