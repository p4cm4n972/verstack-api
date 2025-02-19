import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {

    @Prop()
    firstName: string;

    @Prop()
    lastName: string;

    @Prop()
    pseudo: string;

    @Prop()   
    email: string;

    @Prop()
    password: string;

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

    @Prop()
    profilePicture: string;

    @Prop({type: [Object], default: []})
    favoris: object[];

    
}

export const UserSchema = SchemaFactory.createForClass(User);