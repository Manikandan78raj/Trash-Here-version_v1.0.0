import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class WasteCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.wasteCategory.findMany({
      orderBy: { pricePerKg: "desc" },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.wasteCategory.findUnique({
      where: { slug },
    });
    if (!category)
      throw new NotFoundException(`Waste category '${slug}' not found`);
    return category;
  }

  async calculateValue(categoryId: string, weightKg: number) {
    const category = await this.prisma.wasteCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException("Waste category not found");

    const estimatedPayout = Number((category.pricePerKg * weightKg).toFixed(2));
    const rewardPoints = Math.round(weightKg * category.pointMultiplier);
    const co2SavedKg = Number((category.co2SavedPerKg * weightKg).toFixed(2));

    return {
      categoryName: category.name,
      weightKg,
      pricePerKg: category.pricePerKg,
      estimatedPayout,
      rewardPoints,
      co2SavedKg,
    };
  }
}
