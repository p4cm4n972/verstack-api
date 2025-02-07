import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class EventEntity  extends mongoose.Document {
    @Prop()
    type: string;

    @Prop({index: true})
    name: string;

    @Prop({type: mongoose.SchemaTypes.Mixed})
    payload: Record<string, any>;
}

export const EventSchema = SchemaFactory.createForClass(EventEntity);
EventSchema.index({name: 1, type: -1});
