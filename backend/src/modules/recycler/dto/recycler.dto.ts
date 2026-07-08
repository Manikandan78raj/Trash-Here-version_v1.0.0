import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import {
  IntakeSourceType,
  InspectionGrade,
  ContaminantType,
  ContaminantSeverity,
  ContaminantAction,
  ProcessingStage,
  ManifestType,
} from "@prisma/client";

export class CheckInLoadDto {
  @IsString()
  @IsNotEmpty()
  truckPlate: string;

  @IsString()
  @IsNotEmpty()
  driverName: string;

  @IsEnum(IntakeSourceType)
  @IsOptional()
  sourceType?: IntakeSourceType;

  @IsString()
  @IsOptional()
  collectorId?: string;

  @IsString()
  @IsOptional()
  scheduledArrival?: string;
}

export class RecordWeighInDto {
  @IsString()
  @IsNotEmpty()
  scaleId: string;
}

export class ContaminantItemDto {
  @IsEnum(ContaminantType)
  contaminantType: ContaminantType;

  @IsEnum(ContaminantSeverity)
  @IsOptional()
  severity?: ContaminantSeverity;

  @IsNumber()
  @Min(0)
  estimatedWeightKg: number;

  @IsEnum(ContaminantAction)
  @IsOptional()
  actionTaken?: ContaminantAction;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}

export class RecordInspectionDto {
  @IsEnum(InspectionGrade)
  overallGrade: InspectionGrade;

  @IsNumber()
  @Min(0)
  @Max(100)
  moisturePercent: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  contaminationRate: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContaminantItemDto)
  @IsOptional()
  contaminants?: ContaminantItemDto[];
}

export class RecordWeighOutDto {
  @IsString()
  @IsNotEmpty()
  scaleId: string;
}

export class CreateMaterialBatchDto {
  @IsString()
  @IsOptional()
  loadId?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  @Min(0.1)
  weightKg: number;

  @IsString()
  @IsOptional()
  warehouseLocation?: string;
}

export class StartProcessingDto {
  @IsString()
  @IsNotEmpty()
  batchId: string;

  @IsString()
  @IsNotEmpty()
  machineId: string;

  @IsEnum(ProcessingStage)
  processStage: ProcessingStage;

  @IsNumber()
  @Min(0.1)
  inputWeightKg: number;
}

export class CompleteProcessingDto {
  @IsNumber()
  @Min(0)
  outputWeightKg: number;

  @IsNumber()
  @Min(0)
  wasteLossKg: number;
}

export class GenerateEsgReportDto {
  @IsString()
  @IsNotEmpty()
  reportingPeriod: string; // e.g., "2026-Q2"

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;
}

export class IssueManifestDto {
  @IsString()
  @IsOptional()
  loadId?: string;

  @IsString()
  @IsOptional()
  esgReportId?: string;

  @IsEnum(ManifestType)
  manifestType: ManifestType;

  @IsString()
  @IsNotEmpty()
  issuedTo: string;
}
