import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../enums/role.enum';
import { Permission, PermissionType } from '../../iam/permission.type';


@Schema()
export class User extends Document {
    @Prop()
    sexe: string;

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

    @Prop({ enum: Role, default: Role.Regular })
    role: Role;

    @Prop({ enum: Permission, default: [], type: [String] })
    permissions: PermissionType[];


    @Prop()
    profilePicture: string;

    @Prop({ type: [Object], default: [] })
    favoris: object[];

    @Prop({ type: [Object], default: [] })
    projects: object[];

    @Prop({ type: [String], default: [] })
    contacts: string[];

    @Prop({ default: 0 })
    profileViews: number;

    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop()
    stripeCustomerId?: string;

    @Prop({ type: Types.ObjectId, ref: 'Subscription' })
    subscriptionId?: Types.ObjectId;

}

export const UserSchema = SchemaFactory.createForClass(User);