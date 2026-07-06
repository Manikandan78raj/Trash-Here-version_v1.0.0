export interface ManifestTemplateDto {
  manifestNumber: string;
  manifestType: string;
  facilityName: string;
  facilityCode: string;
  licenseNumber: string;
  loadDetails?: {
    truckPlate: string;
    driverName: string;
    grossWeightKg?: number;
    tareWeightKg?: number;
    netWeightKg?: number;
    overallGrade?: string;
    contaminationRate?: number;
  };
  esgSummary?: {
    reportingPeriod: string;
    totalIntakeKg: number;
    totalRecycledKg: number;
    landfillDiversionRate: number;
    co2OffsetKg: number;
    energySavedKwh: number;
    waterSavedLiters: number;
  };
  issuedTo: string;
  issuedAt: string;
}

export interface GeneratedPdfResult {
  buffer: Buffer;
  fileSizeBytes: number;
  sha256Hash: string;
  fileUrl: string;
}

export interface IPdfGeneratorProvider {
  generateManifestPdf(templateData: ManifestTemplateDto): Promise<GeneratedPdfResult>;
  generateEsgReportPdf(reportData: any): Promise<GeneratedPdfResult>;
}
