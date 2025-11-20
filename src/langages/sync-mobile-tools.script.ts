import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';

async function syncMobileTools() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);

    console.log('📱 SYNCHRONISATION DES OUTILS MOBILE\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Run full sync which will sync all configured items including mobile
    const result = await service.syncAll({ concurrency: 5 });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé: ${result.success.length} succès, ${result.failed.length} échecs`);

    if (result.failed.length > 0) {
      console.log('\nÉchecs:');
      result.failed.forEach(f => console.log(`  ❌ ${f.name}: ${f.error}`));
    }

  } finally {
    await app.close();
  }
}

syncMobileTools().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
