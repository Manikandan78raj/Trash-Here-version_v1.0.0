import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProfileDto {
  @ApiProperty({
    example: "Alex Morgan",
    description: "User full name",
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    example: "+1-555-0101",
    description: "Phone number",
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: "https://images.unsplash.com/...",
    description: "Avatar URL",
    required: false,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class CreateAddressDto {
  @ApiProperty({
    example: "Home",
    description: "Address label (Home, Office, Apartment)",
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    example: "742 Evergreen Terrace",
    description: "Street address",
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: "San Francisco", description: "City name" })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: "CA", description: "State or province" })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: "94110", description: "Postal zip code" })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({
    example: 37.7599,
    description: "Latitude coordinate",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({
    example: -122.4148,
    description: "Longitude coordinate",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiProperty({
    example: true,
    description: "Set as default address",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({
    example: "Ring doorbell #4B",
    description: "Pickup instructions",
    required: false,
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}
