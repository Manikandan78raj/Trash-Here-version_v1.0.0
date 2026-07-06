import {
  IsOptional,
  IsBooleanString,
  IsEnum,
  IsInt,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { NotificationCategory, NotificationPriority } from "@prisma/client";

export class NotificationQueryDto {
  @ApiPropertyOptional({
    description: "Filter by read status",
    example: "false",
  })
  @IsBooleanString()
  @IsOptional()
  isRead?: string;

  @ApiPropertyOptional({ enum: NotificationCategory })
  @IsEnum(NotificationCategory)
  @IsOptional()
  category?: NotificationCategory;

  @ApiPropertyOptional({ enum: NotificationPriority })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
