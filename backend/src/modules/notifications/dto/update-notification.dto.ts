import { IsBoolean, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateNotificationDto {
  @ApiPropertyOptional({ description: "Read status flag", example: true })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
