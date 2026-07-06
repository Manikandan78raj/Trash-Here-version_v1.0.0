import {
  IsString,
  IsOptional,
  MaxLength,
  IsPhoneNumber,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: "First Name", example: "Jane" })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ description: "Last Name", example: "Doe" })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ description: "Phone Number", example: "+15559876543" })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: "Primary Street Address",
    example: "123 Green Ave",
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({
    description: "Short user bio",
    example: "Eco-warrior and recycling enthusiast.",
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;
}
