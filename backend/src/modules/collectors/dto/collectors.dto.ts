import {
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsString,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateLocationDto {
  @ApiProperty({ example: 37.7749, description: "Current latitude coordinate" })
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({
    example: -122.4194,
    description: "Current longitude coordinate",
  })
  @IsNumber()
  @IsNotEmpty()
  lng: number;
}

export class ToggleStatusDto {
  @ApiProperty({ example: true, description: "Online status toggle" })
  @IsBoolean()
  @IsNotEmpty()
  isOnline: boolean;
}

export class CompleteJobDto {
  @ApiProperty({
    example: 37.7749,
    description: "Collector latitude at scan time",
  })
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({
    example: -122.4194,
    description: "Collector longitude at scan time",
  })
  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "QR code secret scanned from household bin",
  })
  @IsString()
  @IsNotEmpty()
  qrSecret: string;

  @ApiProperty({ example: 12.5, description: "Actual verified weight in kg" })
  @IsNumber()
  @Min(0.1)
  actualWeightKg: number;
}

export class InstantPayoutDto {
  @ApiProperty({
    example: 25.0,
    description: "Amount in USD to withdraw instantly",
  })
  @IsNumber()
  @Min(10.0)
  amount: number;
}
