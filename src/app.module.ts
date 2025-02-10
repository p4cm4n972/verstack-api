import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FrameworksController } from './frameworks/frameworks.controller';
import { FrameworksService } from './frameworks/frameworks.service';
import { LangagesModule } from './langages/langages.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [LangagesModule, UsersModule, IamModule, MongooseModule.forRoot('mongodb://localhost:27017/mongodb')],
  controllers: [AppController, FrameworksController],
  providers: [AppService, FrameworksService],
})
export class AppModule {}
