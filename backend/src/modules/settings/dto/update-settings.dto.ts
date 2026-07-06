import {
  IsBoolean,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum ThemePreference {
  LIGHT = "LIGHT",
  DARK = "DARK",
  SYSTEM = "SYSTEM",
}

export enum ProfileVisibility {
  PUBLIC = "PUBLIC",
  FRIENDS = "FRIENDS",
  PRIVATE = "PRIVATE",
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: "Email notifications toggle" })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: "SMS notifications toggle" })
  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ description: "Push notifications toggle" })
  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ description: "Pickup alerts toggle" })
  @IsBoolean()
  @IsOptional()
  pickupAlerts?: boolean;

  @ApiPropertyOptional({ description: "Reward alerts toggle" })
  @IsBoolean()
  @IsOptional()
  rewardAlerts?: boolean;

  @ApiPropertyOptional({ description: "Security alerts toggle" })
  @IsBoolean()
  @IsOptional()
  securityAlerts?: boolean;

  @ApiPropertyOptional({ description: "Marketing alerts toggle" })
  @IsBoolean()
  @IsOptional()
  marketingAlerts?: boolean;

  @ApiPropertyOptional({
    enum: ProfileVisibility,
    default: ProfileVisibility.PUBLIC,
  })
  @IsEnum(ProfileVisibility)
  @IsOptional()
  profileVisibility?: string;

  @ApiPropertyOptional({ description: "Location sharing toggle" })
  @IsBoolean()
  @IsOptional()
  locationSharing?: boolean;

  @ApiPropertyOptional({ description: "Data collection consent toggle" })
  @IsBoolean()
  @IsOptional()
  dataCollectionConsent?: boolean;

  @ApiPropertyOptional({ description: "Two factor authentication toggle" })
  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({ description: "Login alerts toggle" })
  @IsBoolean()
  @IsOptional()
  loginAlerts?: boolean;

  @ApiPropertyOptional({
    description: "Session timeout in minutes (min 15, max 1440)",
  })
  @IsInt()
  @Min(15)
  @Max(1440)
  @IsOptional()
  sessionTimeoutMinutes?: number;

  @ApiPropertyOptional({
    enum: ThemePreference,
    default: ThemePreference.SYSTEM,
  })
  @IsEnum(ThemePreference)
  @IsOptional()
  theme?: string;

  @ApiPropertyOptional({ description: "Locale language code", example: "en" })
  @IsString()
  @IsOptional()
  language?: string;
}
