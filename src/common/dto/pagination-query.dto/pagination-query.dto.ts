import { Type } from "class-transformer";
import { IsOptional, IsPositive } from "class-validator";

export class PaginationQueryDto {
    @IsOptional()
    @IsPositive()
   // @Type(() => Number)  => "ou" surcharge dans main.ts  =>  transformOptions: { enableImplicitConversion: true, }
    limit: number;

    @IsOptional()
    @IsPositive()
   // @Type(() => Number)  => "ou"  surcharge dans main.ts  =>  transformOptions: { enableImplicitConversion: true, }
    offset: number;
}
