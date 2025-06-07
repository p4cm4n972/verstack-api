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
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
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
      envFilePath : ['.env' , '/home/ubuntu/.env'],
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
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          secure: false,
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: config.get('MAIL_FROM'),
        },
  template: {
    dir: __dirname + '/templates', // dossier des templates si tu veux
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
      },
    }),
  })
  ],
  controllers: [AppController, MailerTestController],
  providers: [AppService, MailerTestService, CustomLoggerService],
})
export class AppModule {}
