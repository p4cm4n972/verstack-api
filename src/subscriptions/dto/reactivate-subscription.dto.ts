import { IsMongoId } from 'class-validator';

export class ReactivateSubscriptionDto {
  @IsMongoId()
  userId: string;
}
