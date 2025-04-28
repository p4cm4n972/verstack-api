import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNewsDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    resume: string

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    author?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsOptional()
    img?: string;
}

