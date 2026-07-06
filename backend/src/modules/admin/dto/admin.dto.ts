import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, IsBoolean, Min, Max, IsDateString } from 'class-validator';
import { RoleType, DispatchStatus } from '@prisma/client';

export class AssignRoleDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(RoleType)
  roleType: RoleType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];
}

export class CreateDispatchOrderDto {
  @IsString()
  @IsNotEmpty()
  pickupRequestId: string;

  @IsString()
  @IsOptional()
  collectorId?: string;

  @IsNumber()
  @IsOptional()
  ttlSeconds?: number = 30;
}

export class ReassignRouteDto {
  @IsString()
  @IsNotEmpty()
  pickupRequestId: string;

  @IsString()
  @IsNotEmpty()
  newCollectorId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class StartImpersonationDto {
  @IsString()
  @IsNotEmpty()
  targetUserId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class StopImpersonationDto {
  @IsString()
  @IsNotEmpty()
  impersonationLogId: string;
}

export class UpdateSystemConfigDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AuditFilterDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  action?: string;

  @IsString()
  @IsOptional()
  entity?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 50;

  @IsNumber()
  @Min(0)
  @IsOptional()
  offset?: number = 0;
}

export class FinanceReconcileDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
