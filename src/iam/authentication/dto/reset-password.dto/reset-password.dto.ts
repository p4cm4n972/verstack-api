import { IsJWT, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
    @IsJWT()
    token: string;
  
    @IsString()
    @MinLength(8)
    newPassword: string;
}
