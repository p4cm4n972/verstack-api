import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function resyncLtsLanguages() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔄 RE-SYNCHRONISATION DES LANGAGES AVEC LTS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { SYNC_LANGAGES } = await import('./langage-sync.config');

    const languagesToSync = ['Laravel', 'C#', 'Symfony', 'Django'];

    for (const langName of languagesToSync) {
      const config = SYNC_LANGAGES.find((c: any) => c.nameInDb === langName);

      if (!config) {
        console.log(`⚠️  ${langName}: Configuration introuvable`);
        continue;
      }

      console.log(`🔹 ${langName}:`);
      console.log(`   sourceType: ${config.sourceType}`);
      console.log(`   ltsTagPrefix: ${config.ltsTagPrefix || 'N/A'}`);

      // État avant
      const langBefore = await langageModel.findOne({ name: langName }).exec();
      const ltsBefore = langBefore?.versions?.find((v: any) => v.type === 'lts');
      const currentBefore = langBefore?.versions?.find((v: any) => v.type === 'current');
      console.log(`   Avant: current=${currentBefore?.label || 'N/A'}, lts=${ltsBefore?.label || 'N/A'}`);

      // Re-synchroniser
      try {
        if (config.sourceType === 'github' && config.useTags) {
          await service.updateFromGitHubTag(config);
        } else if (config.sourceType === 'github') {
          await service.updateFromGitHubRelease(config);
        } else if (config.sourceType === 'custom') {
          await service.updateCustom(config);
        }

        // État après
        const langAfter = await langageModel.findOne({ name: langName }).exec();
        const ltsAfter = langAfter?.versions?.find((v: any) => v.type === 'lts');
        const currentAfter = langAfter?.versions?.find((v: any) => v.type === 'current');
        console.log(`   Après: current=${currentAfter?.label || 'N/A'}, lts=${ltsAfter?.label || 'N/A'}`);

        if (ltsAfter) {
          console.log(`   ✅ Version LTS récupérée: ${ltsAfter.label}`);
        } else {
          console.log(`   ⚠️  Pas de version LTS trouvée`);
        }
      } catch (error: any) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }

      console.log('');
    }

    console.log('\n💡 RÉSUMÉ FINAL:');
    console.log('═══════════════════════════════════════════════════════════\n');

    let successCount = 0;
    for (const langName of languagesToSync) {
      const lang = await langageModel.findOne({ name: langName }).exec();
      const lts = lang?.versions?.find((v: any) => v.type === 'lts');
      const current = lang?.versions?.find((v: any) => v.type === 'current');

      if (lts && current) {
        console.log(`  ✅ ${langName}: current=${current.label}, lts=${lts.label}`);
        successCount++;
      } else if (current) {
        console.log(`  ⚠️  ${langName}: current=${current.label}, lts=MANQUANT`);
      } else {
        console.log(`  ❌ ${langName}: Problème de synchronisation`);
      }
    }

    console.log(`\n  Total avec LTS: ${successCount}/${languagesToSync.length}`);

  } finally {
    await app.close();
  }
}

resyncLtsLanguages().catch(error => {
  console.error('❌ Erreur lors de la re-synchronisation:', error);
  process.exit(1);
});
