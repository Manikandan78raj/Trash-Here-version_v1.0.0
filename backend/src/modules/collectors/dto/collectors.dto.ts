import { IsNumber, IsBoolean, IsNotEmpty } from "class-validator";
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
