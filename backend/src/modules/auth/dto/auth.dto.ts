import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { RoleType } from "@prisma/client";

export class LoginDto {
  @ApiProperty({
    example: "user@trashhere.com",
    description: "User email address",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "Password123!", description: "User password" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: "Alex Morgan", description: "Full legal name" })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: "user@trashhere.com",
    description: "User email address",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "+1-555-0199",
    description: "Phone number with country code",
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: "Password123!", description: "Strong password" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    enum: RoleType,
    default: RoleType.USER,
    description: "Role to register as",
  })
  @IsEnum(RoleType)
  @IsOptional()
  role?: RoleType;
}

export class SendOtpDto {
  @ApiProperty({
    example: "+1-555-0101",
    description: "Phone number for OTP verification",
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: "+1-555-0101", description: "Phone number" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: "123456", description: "6-digit OTP code" })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
