import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { PickupStatus } from "@prisma/client";

export class PickupItemDto {
  @ApiProperty({
    example: "uuid-of-category",
    description: "Waste category ID",
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 15.5, description: "Estimated weight in kg" })
  @IsNumber()
  @IsNotEmpty()
  estimatedWeightKg: number;

  @ApiProperty({
    example: "https://images.unsplash.com/...",
    description: "AI analyzed photo URL",
    required: false,
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({
    example: 0.96,
    description: "AI category confidence score (0.0 to 1.0)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  aiConfidence?: number;
}

export class CreatePickupDto {
  @ApiProperty({
    example: "uuid-of-address",
    description: "Address ID where pickup is scheduled",
  })
  @IsString()
  @IsNotEmpty()
  addressId: string;

  @ApiProperty({
    example: "2026-07-10T14:00:00Z",
    description: "Scheduled date and time",
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiProperty({
    type: [PickupItemDto],
    description: "List of waste items to collect",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PickupItemDto)
  items: PickupItemDto[];

  @ApiProperty({
    example: "Ring doorbell #4B. Heavy monitors in boxes.",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePickupStatusDto {
  @ApiProperty({ enum: PickupStatus, description: "New pickup status" })
  @IsEnum(PickupStatus)
  @IsNotEmpty()
  status: PickupStatus;
}

export class VerifyPickupQrDto {
  @ApiProperty({
    example: "uuid-qr-secret",
    description: "QR Code secret generated for customer",
  })
  @IsString()
  @IsNotEmpty()
  qrCodeSecret: string;

  @ApiProperty({ example: 19.5, description: "Verified actual weight in kg" })
  @IsNumber()
  @IsNotEmpty()
  actualWeightKg: number;
}
