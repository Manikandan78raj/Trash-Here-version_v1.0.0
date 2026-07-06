import { Test, TestingModule } from "@nestjs/testing";
import { WasteCategoriesService } from "./waste-categories.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("WasteCategoriesService", () => {
  let service: WasteCategoriesService;
  let prisma: PrismaService;

  const mockCategory = {
    id: "cat-1",
    name: "Electronic Waste",
    slug: "e-waste",
    description: "Old electronics",
    iconUrl: "icon.png",
    pricePerKg: 4.5,
    pointMultiplier: 30,
    co2SavedPerKg: 3.5,
    isActive: true,
  };

  const mockPrismaService = {
    wasteCategory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WasteCategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WasteCategoriesService>(WasteCategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of waste categories ordered by pricePerKg desc", async () => {
      mockPrismaService.wasteCategory.findMany.mockResolvedValue([
        mockCategory,
      ]);
      const result = await service.findAll();
      expect(result).toEqual([mockCategory]);
      expect(mockPrismaService.wasteCategory.findMany).toHaveBeenCalledWith({
        orderBy: { pricePerKg: "desc" },
      });
    });
  });

  describe("findBySlug", () => {
    it("should return a waste category if slug exists", async () => {
      mockPrismaService.wasteCategory.findUnique.mockResolvedValue(
        mockCategory,
      );
      const result = await service.findBySlug("e-waste");
      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.wasteCategory.findUnique).toHaveBeenCalledWith({
        where: { slug: "e-waste" },
      });
    });

    it("should throw NotFoundException if slug does not exist", async () => {
      mockPrismaService.wasteCategory.findUnique.mockResolvedValue(null);
      await expect(service.findBySlug("unknown-slug")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("calculateValue", () => {
    it("should calculate estimated payout, reward points, and CO2 saved correctly", async () => {
      mockPrismaService.wasteCategory.findUnique.mockResolvedValue(
        mockCategory,
      );
      const result = await service.calculateValue("cat-1", 10);
      expect(result).toEqual({
        categoryName: "Electronic Waste",
        weightKg: 10,
        pricePerKg: 4.5,
        estimatedPayout: 45.0,
        rewardPoints: 300,
        co2SavedKg: 35.0,
      });
    });

    it("should throw NotFoundException if categoryId is not found", async () => {
      mockPrismaService.wasteCategory.findUnique.mockResolvedValue(null);
      await expect(service.calculateValue("unknown-id", 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
