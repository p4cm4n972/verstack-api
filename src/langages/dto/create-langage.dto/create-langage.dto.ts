import { IsString, IsNotEmpty, IsArray, IsDate } from 'class-validator';

export class CreateLangageDto {
    
@IsString()
@IsNotEmpty()
readonly name: string;

@IsString()
@IsNotEmpty()
readonly description: string;

@IsString()
@IsNotEmpty()
readonly logoUrl: string;

@IsString()
@IsNotEmpty()
readonly documentation: string;

@IsArray()
@IsNotEmpty({ each: true })
readonly domain: string[];

@IsString()
@IsNotEmpty()
readonly currentVersion: string;

@IsString()
@IsNotEmpty()
readonly ltsVersion: string;

@IsString()
@IsNotEmpty()
readonly releaseDate: string;
}
