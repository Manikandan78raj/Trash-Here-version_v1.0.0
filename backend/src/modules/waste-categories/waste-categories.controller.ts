import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { WasteCategoriesService } from "./waste-categories.service";

@ApiTags("Waste Categories & Pricing")
@Controller("waste-categories")
export class WasteCategoriesController {
  constructor(
    private readonly wasteCategoriesService: WasteCategoriesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Get all active recyclable waste categories with live prices",
  })
  @ApiResponse({
    status: 200,
    description: "List of waste categories returned",
  })
  async findAll() {
    return this.wasteCategoriesService.findAll();
  }

  @Get("calculate")
  @ApiOperation({
    summary:
      "Calculate payout, reward points, and CO2 offset for a given weight",
  })
  @ApiQuery({
    name: "categoryId",
    required: true,
    description: "UUID of the waste category",
  })
  @ApiQuery({
    name: "weightKg",
    required: true,
    type: Number,
    description: "Estimated weight in kg",
  })
  async calculateValue(
    @Query("categoryId") categoryId: string,
    @Query("weightKg") weightKg: number,
  ) {
    return this.wasteCategoriesService.calculateValue(categoryId, weightKg);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get waste category details by slug" })
  async findBySlug(@Param("slug") slug: string) {
    return this.wasteCategoriesService.findBySlug(slug);
  }
}
