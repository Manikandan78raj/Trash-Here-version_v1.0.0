import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateEmailDto {
  @ApiProperty({
    description: "New Email Address",
    example: "new.email@example.com",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty()
  newEmail!: string;

  @ApiProperty({
    description: "Current Password for verification",
    example: "SecretPass123!",
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
