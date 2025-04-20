import { IsString, IsNotEmpty, IsBoolean, IsEmail, MinLength, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {

  @IsString()
  @IsOptional()
  sexe: string;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

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

  @IsString()
  @IsOptional()
  profilePicture: string;

  @IsArray()
  @IsOptional()
  favoris: object[];

  @IsString({ each: true })
  @IsOptional()
  friends: string[];

  @IsString({ each: true })
  @IsOptional()
  projets: string[];

  @IsBoolean()
  @IsNotEmpty()
  isEmailVerified: boolean;
}
