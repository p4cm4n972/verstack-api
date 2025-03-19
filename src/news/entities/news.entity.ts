import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class News extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  resume: string;

  @Prop({ required: true })
  img: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  author?: string;

  @Prop({ required: true })
  category?: string;

  @Prop({ required: true })
  date: string;

  @Prop({default: 0})
    recommendations: number;
}

export const NewsSchema = SchemaFactory.createForClass(News);
