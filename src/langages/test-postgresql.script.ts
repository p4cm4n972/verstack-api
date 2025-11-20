import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function testPostgresql() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔄 TEST SYNCHRONISATION POSTGRESQL\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { SYNC_LANGAGES } = await import('./langage-sync.config');
    const config = SYNC_LANGAGES.find((c: any) => c.nameInDb === 'PostgreSQL');

    if (!config) {
      console.log('❌ Configuration PostgreSQL introuvable');
      return;
    }

    // État avant
    const before = await langageModel.findOne({ name: 'PostgreSQL' }).exec();
    console.log('Avant:');
    if (before?.versions && before.versions.length > 0) {
      before.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    } else {
      console.log('  (aucune version)');
    }

    // Synchroniser
    console.log('\n🔄 Synchronisation...\n');
    await service.updateCustom(config);

    // État après
    const after = await langageModel.findOne({ name: 'PostgreSQL' }).exec();
    console.log('\nAprès:');
    if (after?.versions && after.versions.length > 0) {
      after.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
      console.log('\n✅ PostgreSQL synchronisé avec succès!');
    } else {
      console.log('  (aucune version)');
      console.log('\n⚠️ Problème de synchronisation');
    }

  } finally {
    await app.close();
  }
}

testPostgresql().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
