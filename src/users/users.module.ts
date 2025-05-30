import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
    imports: [MongooseModule.forFeature([
        {
            name: User.name,
            schema: UserSchema,
        },
    ])],
    controllers: [UsersController],
    providers: [{ provide: UsersService, useClass: UsersService }],
})
export class UsersModule {}
