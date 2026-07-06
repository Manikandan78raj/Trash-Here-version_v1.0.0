import { IsString, IsNotEmpty, MinLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
  @ApiProperty({ description: "Current Password", example: "OldPassword123!" })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({
    description:
      "New Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)",
    example: "NewStrongPass2026!",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    },
  )
  newPassword!: string;
}
