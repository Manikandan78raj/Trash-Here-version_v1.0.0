import { Injectable, Logger } from '@nestjs/common';
import { IEsgReportProvider, CarbonOffsetCalculation } from '../interfaces/esg-report.provider.interface';

@Injectable()
export class GhgProtocolEsgProvider implements IEsgReportProvider {
  private readonly logger = new Logger(GhgProtocolEsgProvider.name);

  // Standard EPA & GHG Protocol Lifecycle Assessment (LCA) Multipliers per kg recycled
  private readonly multipliers: Record<string, { co2: number; energy: number; water: number }> = {
    'plastics-pet': { co2: 2.5, energy: 5.2, water: 15.0 },
    'plastics-hdpe': { co2: 2.1, energy: 4.8, water: 12.0 },
    'paper-cardboard': { co2: 1.8, energy: 4.0, water: 26.0 },
    'metals-aluminum': { co2: 9.1, energy: 14.0, water: 40.0 },
    'metals-steel': { co2: 1.8, energy: 3.5, water: 8.0 },
    'glass-clear': { co2: 0.6, energy: 1.2, water: 4.0 },
    'electronics-ewaste': { co2: 15.0, energy: 25.0, water: 100.0 },
    'default': { co2: 2.0, energy: 4.5, water: 15.0 },
  };

  calculateCarbonOffset(categorySlug: string, netWeightKg: number): CarbonOffsetCalculation {
    const slugKey = categorySlug ? categorySlug.toLowerCase() : 'default';
    const factor = this.multipliers[slugKey] || this.multipliers['default'];

    const co2OffsetKg = Number((netWeightKg * factor.co2).toFixed(2));
    const energySavedKwh = Number((netWeightKg * factor.energy).toFixed(2));
    const waterSavedLiters = Number((netWeightKg * factor.water).toFixed(2));

    this.logger.debug(`Calculated GHG offsets for [${categorySlug || 'default'}] (${netWeightKg}kg): CO2=${co2OffsetKg}kg, Energy=${energySavedKwh}kWh`);
    return { co2OffsetKg, energySavedKwh, waterSavedLiters };
  }

  calculateDiversionRate(totalIntakeKg: number, totalRecycledKg: number): number {
    if (totalIntakeKg <= 0) return 100.0;
    const rate = (totalRecycledKg / totalIntakeKg) * 100.0;
    return Number(Math.min(100.0, Math.max(0.0, rate)).toFixed(2));
  }
}
