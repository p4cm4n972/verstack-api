import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FrameworksController } from './frameworks/frameworks.controller';
import { FrameworksService } from './frameworks/frameworks.service';
import { LangagesModule } from './langages/langages.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { IamModule } from './iam/iam.module';
import { ConfigModule } from '@nestjs/config';
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    LangagesModule,
    UsersModule,
    IamModule,
    NewsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/admin',
    ),
  ],
  controllers: [AppController, FrameworksController],
  providers: [AppService, FrameworksService],
})
export class AppModule {}
