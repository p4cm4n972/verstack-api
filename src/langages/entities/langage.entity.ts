import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LangageDocument = Langage & Document;

@Schema({ _id: true, timestamps: true })
export class Version {
  @Prop({ required: true })
  type: 'current' | 'lts' | 'edition' | 'livingStandard' | 'standard';

  @Prop({ required: true })
  label: string;

  @Prop()
  releaseDate?: string;

  @Prop()
  endSupport?: string;

  @Prop()
  supportDuration?: number; 
}

@Schema()
export class Langage extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  logoUrl: string;

  @Prop({ required: true })
  documentation: string;

  @Prop({ type: [String], enum: ['web', 'mobile', 'embedded', 'datascience', 'ia', 'game', 'backend', 'frontend', 'desktop', 'devops'], required: true })
  domain: string[];

  @Prop({ type: [Version], required: true })
  versions: Version[];

  @Prop({ required: true })
  initialRelease: string;

  @Prop({ default: 0.0 })
  recommendations: number;
  
}

export const LangageSchema = SchemaFactory.createForClass(Langage);
