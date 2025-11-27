import { IsMongoId, IsBoolean } from 'class-validator';

export class CancelSubscriptionDto {
  @IsMongoId()
  userId: string;

  @IsBoolean()
  immediate: boolean;
}
