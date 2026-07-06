import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsDateString,
  IsUUID,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NotificationPriority, NotificationCategory } from "@prisma/client";

export class CreateNotificationDto {
  @ApiProperty({
    description: "Target User UUID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: "Notification Title",
    example: "Pickup Scheduled",
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: "Notification Message Content",
    example: "Your pickup has been assigned to driver John.",
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ description: "Notification Type", default: "INFO" })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @ApiPropertyOptional({
    enum: NotificationCategory,
    default: NotificationCategory.SYSTEM,
  })
  @IsEnum(NotificationCategory)
  @IsOptional()
  category?: NotificationCategory;

  @ApiPropertyOptional({
    description: "Action URL / Deep Link",
    example: "/app/tracking",
  })
  @IsString()
  @IsOptional()
  actionUrl?: string;

  @ApiPropertyOptional({ description: "Arbitrary JSON metadata" })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: "ISO expiration timestamp" })
  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @ApiPropertyOptional({ description: "ISO scheduled delivery timestamp" })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
