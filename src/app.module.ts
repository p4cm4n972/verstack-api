import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FrameworksController } from './frameworks/frameworks.controller';
import { UsersController } from './users/users.controller';
import { FrameworksService } from './frameworks/frameworks.service';
import { UsersService } from './users/users.service';
import { LangagesModule } from './langages/langages.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [LangagesModule, MongooseModule.forRoot('mongodb://localhost:27017/mongodb')],
  controllers: [AppController, FrameworksController, UsersController],
  providers: [AppService, FrameworksService, UsersService],
})
export class AppModule {}
