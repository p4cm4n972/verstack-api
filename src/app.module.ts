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
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { SubscriptionCleanupService } from './jobs/subscription-cleanup.service';
import { Subscription, SubscriptionSchema } from './subscriptions/schemas/subscription.schema';
import { User, UserSchema } from './users/entities/user.entity';
import stripeConfig from './config/stripe.config';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    LangagesModule,
    UsersModule,
    IamModule,
    NewsModule,
    AdminModule,
    StatsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '/home/ubuntu/.env'],
      load: [stripeConfig],
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
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ScheduleModule.forRoot(),
    SubscriptionsModule,
    WebhooksModule,
  ],
  controllers: [AppController, MailerTestController],
  providers: [AppService, MailService, MailerTestService, CustomLoggerService, SubscriptionCleanupService],
})
export class AppModule { }
