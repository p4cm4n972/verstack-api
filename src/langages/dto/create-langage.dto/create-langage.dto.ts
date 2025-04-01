import {
    IsString,
    IsNotEmpty,
    IsUrl,
    IsArray,
    ValidateNested,
    IsDateString,
    IsEnum,
    IsOptional
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export enum LangageDomain {
    WEB = 'web',
    MOBILE = 'mobile',
    EMBEDDED = 'embedded',
    DATASCIENCE = 'datascience',
    IA = 'ia',
    GAME = 'game'
  }
  
  export enum VersionType {
    CURRENT = 'current',
    LTS = 'lts',
    EDITION = 'edition',
    LIVING_STANDARD = 'livingStandard'
  }
  
  export class VersionDto {
    @IsEnum(VersionType)
    @IsNotEmpty()
    readonly type: VersionType;
  
    @IsString()
    @IsNotEmpty()
    readonly label: string;
  
    @IsOptional()
    @IsDateString()
    readonly releaseDate?: string;
  }
  
  export class CreateLangageDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;
  
    @IsString()
    @IsNotEmpty()
    readonly description: string;
  
    @IsUrl()
    @IsNotEmpty()
    readonly logoUrl: string;
  
    @IsUrl()
    @IsNotEmpty()
    readonly documentation: string;
  
    @IsArray()
    @IsNotEmpty({ each: true })
    @IsEnum(LangageDomain, { each: true })
    readonly domain: LangageDomain[];
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VersionDto)
    readonly versions: VersionDto[];
  
    @IsDateString()
    readonly initialRelease: string;
  }
  