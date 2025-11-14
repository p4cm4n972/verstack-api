import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateService } from '../langages/langage-update.service';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Support --dry-run to avoid DB writes
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) process.env.DRY_RUN = '1';

  const syncService = app.get(LangageUpdateService);
  await syncService.syncAll();

  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ Erreur de synchronisation CLI :', err);
  process.exit(1);
});
