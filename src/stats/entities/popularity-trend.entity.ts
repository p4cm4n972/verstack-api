import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PopularityTrend extends Document {
  @Prop({ required: true, unique: true })
  language: string;

  @Prop({ type: [Number], default: [] })
  popularity: number[];

  @Prop({ type: Object })
  sources: {
    stackoverflow: number;
    tiobe: number;
    github: number;
  };

  @Prop()
  average: number;

  @Prop({ enum: ['up', 'down', 'stable'] })
  trend: string;

  @Prop({ type: Object })
  metadata: {
    color?: string;
    category?: string;
    scoreDetails?: any;
  };

  @Prop()
  lastUpdated: Date;
}

export const PopularityTrendSchema = SchemaFactory.createForClass(PopularityTrend);
