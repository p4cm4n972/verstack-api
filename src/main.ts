import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { CustomLoggerService } from './custom-logger/custom-logger.service';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerConfig } from './common/logger/winston-logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonLoggerConfig),
    // IMPORTANT: raw body pour webhooks Stripe
    rawBody: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    }),
  );
  // CORS configuration pour Vercel et développement local
  app.enableCors({
    origin: [
      'https://verstack.io',
      'https://www.verstack.io',
      'https://verstack-ihm.vercel.app',
      /\.vercel\.app$/,  // Tous les sous-domaines Vercel (preview deployments)
      'http://localhost:4200',  // Dev local Angular
      'http://localhost:4000',  // Dev local SSR
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
  await app.listen(process.env.PORT ?? 3000);
  Logger.log(
    `Application is running on: ${await app.getUrl()}`,
    'Bootstrap',
  );
}
bootstrap();
