import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication/authentication.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { AuthenticationService } from './authentication/authentication.service';
import { UsersService } from 'src/users/users.service';

@Module({
    imports: [MongooseModule.forFeature([
            {
                name: User.name,
                schema: UserSchema,
            },
        ])],
        controllers: [AuthenticationController],
    providers: [UsersService, AuthenticationService],
})
export class IamModule {}
