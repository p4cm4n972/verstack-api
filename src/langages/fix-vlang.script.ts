import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function fixVlang() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DE V (Vlang)\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // État avant
    const before = await langageModel.findOne({ name: 'V' }).exec();
    console.log('📋 État AVANT:');
    if (before?.versions && before.versions.length > 0) {
      before.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    } else {
      console.log('  (aucune version)');
    }

    // Nettoyer les versions corrompues
    console.log('\n🧹 Nettoyage des versions corrompues...');
    await langageModel.updateOne(
      { name: 'V' },
      { $set: { versions: [] } }
    ).exec();

    // Re-synchroniser
    console.log('🔄 Re-synchronisation...\n');
    const { SYNC_LANGAGES } = await import('./langage-sync.config');
    const config = SYNC_LANGAGES.find((c: any) => c.nameInDb === 'V');

    if (!config) {
      console.log('❌ Configuration V introuvable');
      return;
    }

    console.log(`Configuration:`);
    console.log(`  sourceType: ${config.sourceType}`);
    console.log(`  sourceUrl: ${config.sourceUrl}`);

    if (config.sourceType === 'github') {
      await service.updateFromGitHubRelease(config);
    }

    // État après
    const after = await langageModel.findOne({ name: 'V' }).exec();
    console.log('\n📋 État APRÈS:');
    if (after?.versions && after.versions.length > 0) {
      after.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
      console.log('\n✅ V (Vlang) synchronisé avec succès!');
    } else {
      console.log('  (aucune version)');
      console.log('\n⚠️ Problème de synchronisation');
    }

  } finally {
    await app.close();
  }
}

fixVlang().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
