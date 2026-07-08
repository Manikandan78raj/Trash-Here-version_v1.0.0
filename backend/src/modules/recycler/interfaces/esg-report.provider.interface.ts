export interface CarbonOffsetCalculation {
  co2OffsetKg: number;
  energySavedKwh: number;
  waterSavedLiters: number;
}

export interface EsgSummaryDto {
  totalIntakeKg: number;
  totalProcessedKg: number;
  totalRecycledKg: number;
  landfillDiversionRate: number;
  co2OffsetKg: number;
  energySavedKwh: number;
  waterSavedLiters: number;
  complianceStatus: "COMPLIANT" | "UNDER_REVIEW" | "NON_COMPLIANT";
}

export interface IEsgReportProvider {
  calculateCarbonOffset(
    categorySlug: string,
    netWeightKg: number,
  ): CarbonOffsetCalculation;
  calculateDiversionRate(
    totalIntakeKg: number,
    totalRecycledKg: number,
  ): number;
}
