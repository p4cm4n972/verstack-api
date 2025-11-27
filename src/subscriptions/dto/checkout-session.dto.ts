import { IsMongoId, IsBoolean } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsMongoId()
  userId: string;

  @IsBoolean()
  prorated: boolean;
}
