import { Module } from '@nestjs/common';
import { AppController, MailerTestController } from './app.controller';
import { AppService } from './app.service';
import { FrameworksController } from './frameworks/frameworks.controller';
import { FrameworksService } from './frameworks/frameworks.service';
import { LangagesModule } from './langages/langages.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { IamModule } from './iam/iam.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NewsModule } from './news/news.module';
import { AdminModule } from './admin/admin.module';
import { MailService } from './mail.service';
import { MailerTestService } from './mailer-test.service';
import { CustomLoggerService } from './custom-logger/custom-logger.service';

@Module({
  imports: [
    LangagesModule,
    UsersModule,
    IamModule,
    NewsModule,
    AdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '/home/ubuntu/.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get<string>('MONGO_URI')
          ? {
            uri: configService.get<string>('MONGO_URI'),
          }
          : {
            uri: 'mongodb://localhost/nest',
          },
    }
    ),
  ],
  controllers: [AppController, MailerTestController],
  providers: [AppService, MailService, MailerTestService, CustomLoggerService],
})
export class AppModule { }
