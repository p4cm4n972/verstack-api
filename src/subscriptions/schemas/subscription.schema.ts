import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  stripeSubscriptionId: string;

  @Prop({ required: true })
  stripeCustomerId: string;

  @Prop({
    type: String,
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
    index: true
  })
  status: SubscriptionStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  nextBillingDate: Date;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'EUR' })
  currency: string;

  @Prop({ default: true })
  autoRenew: boolean;

  @Prop({ type: Object })
  metadata: {
    proratedAmount?: number;
    daysRemaining?: number;
    firstTuesdayRenewal?: boolean;
  };
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Index composé pour optimiser les requêtes
SubscriptionSchema.index({ userId: 1, status: 1 });
