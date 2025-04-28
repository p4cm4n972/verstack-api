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

    @Prop({ type: [String], default: [] })
    likedBy: string[];
}

@Schema()
export class Recommendation extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  articleId: string;
}


export const NewsSchema = SchemaFactory.createForClass(News);

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation)
