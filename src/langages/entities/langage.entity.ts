import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Langage extends Document {
    @Prop()
    name: string;

    @Prop()   
    description: string;

    @Prop()
    logoUrl: string;

    @Prop()
    documentation: string;

    @Prop([String])
    domain: string[];

    @Prop()
    currentVersion: string;

    @Prop()
    ltsVersion: string;

    @Prop()
    releaseDate: string;

    @Prop({default: 0})
    recommendations: number;
}

export const LangageSchema = SchemaFactory.createForClass(Langage);