import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
    @Prop()
    pseudo: string;

    @Prop()   
    email: string;

    @Prop()
    job: string;

    @Prop()
    ageRange: string;

    @Prop()
    SalaryRange: string;

    @Prop()
    experience: string;

    @Prop()
    acceptTerms: string;

    @Prop()
    isAdmin: boolean;

    
}

export const UserSchema = SchemaFactory.createForClass(User);