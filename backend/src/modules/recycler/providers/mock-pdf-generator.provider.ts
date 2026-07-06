import { Injectable, Logger } from '@nestjs/common';
import { IPdfGeneratorProvider, ManifestTemplateDto, GeneratedPdfResult } from '../interfaces/pdf-generator.provider.interface';
import * as crypto from 'crypto';

@Injectable()
export class MockPdfGeneratorProvider implements IPdfGeneratorProvider {
  private readonly logger = new Logger(MockPdfGeneratorProvider.name);

  async generateManifestPdf(templateData: ManifestTemplateDto): Promise<GeneratedPdfResult> {
    this.logger.log(`Generating legal PDF manifest [${templateData.manifestNumber}] of type [${templateData.manifestType}]...`);
    
    // Simulate PDF document buffer generation
    const contentString = `TRASH HERE ENTERPRISE RECYCLING MANIFEST\nManifest: ${templateData.manifestNumber}\nFacility: ${templateData.facilityName} (${templateData.facilityCode})\nIssued To: ${templateData.issuedTo}\nDate: ${templateData.issuedAt}\n`;
    const buffer = Buffer.from(contentString, 'utf-8');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const fileSizeBytes = buffer.length;

    return {
      buffer,
      fileSizeBytes,
      sha256Hash: hash,
      fileUrl: `https://cdn.trashhere.com/manifests/${templateData.manifestNumber}-${hash.substring(0, 8)}.pdf`,
    };
  }

  async generateEsgReportPdf(reportData: any): Promise<GeneratedPdfResult> {
    this.logger.log(`Generating ESG Sustainability Report PDF for period [${reportData.reportingPeriod || 'ANNUAL'}]...`);
    
    const contentString = `TRASH HERE ESG COMPLIANCE REPORT\nPeriod: ${reportData.reportingPeriod}\nDiversion Rate: ${reportData.landfillDiversionRate}%\nCO2 Offset: ${reportData.co2OffsetKg} kg\n`;
    const buffer = Buffer.from(contentString, 'utf-8');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const fileSizeBytes = buffer.length;

    return {
      buffer,
      fileSizeBytes,
      sha256Hash: hash,
      fileUrl: `https://cdn.trashhere.com/esg-reports/${reportData.reportNumber || 'ESG'}-${hash.substring(0, 8)}.pdf`,
    };
  }
}
