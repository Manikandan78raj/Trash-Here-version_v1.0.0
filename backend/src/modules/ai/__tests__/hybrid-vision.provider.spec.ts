import { Test, TestingModule } from "@nestjs/testing";
import { AiRecommendationType } from "@prisma/client";
import { HybridVisionProvider } from "../providers/hybrid-vision.provider";
import { YoloVisionProvider } from "../providers/yolo-vision.provider";
import { OpenAiVisionProvider } from "../providers/openai-vision.provider";
import { GeminiVisionProvider } from "../providers/gemini-vision.provider";
import { AiDetectionResponse } from "../interfaces/ai.interface";

describe("HybridVisionProvider (TDD)", () => {
  let provider: HybridVisionProvider;
  let yoloProvider: YoloVisionProvider;
  let openAiProvider: OpenAiVisionProvider;
  let geminiProvider: GeminiVisionProvider;

  const mockYoloResponse: AiDetectionResponse = {
    modelName: "yolov8-waste-v2.4",
    processingTimeMs: 110,
    overallConfidence: 0.94,
    primaryMaterialCategory: "PLASTIC_PET",
    isContaminated: false,
    contaminationPercentage: 0.0,
    recommendationType: AiRecommendationType.DIRECT_RECYCLE,
    actionableInstructions: "Clean bottle",
    estimatedWeightKg: 0.5,
    co2SavedKg: 1.25,
    greenPointsEarned: 15,
    detectedObjects: [
      {
        label: "PET_BOTTLE",
        confidence: 0.95,
        boundingBox: { xMin: 0.1, yMin: 0.1, xMax: 0.9, yMax: 0.9 },
        materialType: "PLASTIC_PET",
        isContaminant: false,
      },
    ],
  };

  const mockOpenAiResponse: AiDetectionResponse = {
    modelName: "gpt-4o-vision-2026",
    processingTimeMs: 450,
    overallConfidence: 0.98,
    primaryMaterialCategory: "PLASTIC_PET",
    isContaminated: false,
    contaminationPercentage: 2.0,
    recommendationType: AiRecommendationType.DIRECT_RECYCLE,
    actionableInstructions: "Remove cap and recycle",
    estimatedWeightKg: 0.52,
    co2SavedKg: 1.3,
    greenPointsEarned: 16,
    detectedObjects: [
      {
        label: "PET_BOTTLE",
        confidence: 0.98,
        boundingBox: { xMin: 0.12, yMin: 0.12, xMax: 0.88, yMax: 0.88 },
        materialType: "PLASTIC_PET_GRADE_1",
        isContaminant: false,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HybridVisionProvider,
        {
          provide: YoloVisionProvider,
          useValue: {
            detectWaste: jest.fn().mockResolvedValue(mockYoloResponse),
            getHealth: jest.fn().mockResolvedValue({ isHealthy: true }),
          },
        },
        {
          provide: OpenAiVisionProvider,
          useValue: {
            detectWaste: jest.fn().mockResolvedValue(mockOpenAiResponse),
            getHealth: jest.fn().mockResolvedValue({ isHealthy: true }),
          },
        },
        {
          provide: GeminiVisionProvider,
          useValue: {
            detectWaste: jest.fn().mockResolvedValue(mockOpenAiResponse),
            getHealth: jest.fn().mockResolvedValue({ isHealthy: true }),
          },
        },
      ],
    }).compile();

    provider = module.get<HybridVisionProvider>(HybridVisionProvider);
    yoloProvider = module.get<YoloVisionProvider>(YoloVisionProvider);
    openAiProvider = module.get<OpenAiVisionProvider>(OpenAiVisionProvider);
    geminiProvider = module.get<GeminiVisionProvider>(GeminiVisionProvider);
  });

  it("should combine YOLO bounding box localization with OpenAI reasoning", async () => {
    const result = await provider.detectWaste("https://example.com/waste.jpg");
    expect(result.modelName).toBe("hybrid-vision-yolo-gpt4o");
    expect(result.providerName).toBe("hybrid-vision");
    expect(result.modelVersion).toBe("2.0.0-hybrid");
    expect(result.detectionConfidence).toBe(0.94);
    expect(result.classificationConfidence).toBe(0.98);
    expect(result.recommendationConfidence).toBe(0.98);
    expect(result.overallConfidence).toBe(0.96); // 0.94*0.4 + 0.98*0.6 = 0.964 -> 0.96
    expect(result.detectedObjects[0].materialType).toBe("PLASTIC_PET_GRADE_1");
  });

  it("should fallback to Gemini if OpenAI reasoning fails", async () => {
    jest
      .spyOn(openAiProvider, "detectWaste")
      .mockRejectedValueOnce(new Error("OpenAI Rate Limit"));

    const result = await provider.detectWaste("https://example.com/waste.jpg");
    expect(result.modelName).toBe("hybrid-vision-yolo-gpt4o");
    expect(geminiProvider.detectWaste).toHaveBeenCalled();
  });

  it("should return YOLO only if both reasoning providers fail", async () => {
    jest
      .spyOn(openAiProvider, "detectWaste")
      .mockRejectedValueOnce(new Error("OpenAI Error"));
    jest
      .spyOn(geminiProvider, "detectWaste")
      .mockRejectedValueOnce(new Error("Gemini Error"));

    const result = await provider.detectWaste("https://example.com/waste.jpg");
    expect(result.modelName).toBe("hybrid-vision-yolo-only");
    expect(result.detectionConfidence).toBe(0.94);
  });

  it("should check health of underlying providers", async () => {
    const health = await provider.getHealth();
    expect(health.isHealthy).toBe(true);
    expect(health.modelVersion).toBe("2.0.0-hybrid");
  });
});
