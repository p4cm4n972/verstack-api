import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { CustomLoggerService } from './custom-logger/custom-logger.service';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerConfig } from './common/logger/winston-logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonLoggerConfig),
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
  app.enableCors()
  await app.listen(process.env.PORT ?? 3000);
  Logger.log(
    `Application is running on: ${await app.getUrl()}`,
    'Bootstrap',
  );
}
bootstrap();
