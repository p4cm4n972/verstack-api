import { IsString, IsNotEmpty, IsBoolean, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  pseudo: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  job: string;

  @IsString()
  @IsNotEmpty()
  ageRange: string;

  @IsString()
  @IsNotEmpty()
  salaryRange: string;

  @IsString()
  @IsNotEmpty()
  experience: string;

  @IsBoolean()
  @IsNotEmpty()
  acceptTerms: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isAdmin: boolean;
}
