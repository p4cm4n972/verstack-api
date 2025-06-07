import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateService } from '../langages/langage-update.service';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const syncService = app.get(LangageUpdateService);
  await syncService.syncAll();

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ Erreur de synchronisation CLI :', err);
  process.exit(1);
});
