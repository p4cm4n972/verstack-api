import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function fixPerlHaskell() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DE PERL ET HASKELL\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { SYNC_LANGAGES } = await import('./langage-sync.config');

    for (const langName of ['Perl', 'Haskell']) {
      console.log(`📋 ${langName}:`);
      console.log('─────────────────────────────────────────────────────────');

      // État avant
      const before = await langageModel.findOne({ name: langName }).exec();
      console.log('  Avant:');
      if (before?.versions && before.versions.length > 0) {
        before.versions.forEach((v: any) => {
          console.log(`    ${v.type}: ${v.label}`);
        });
      } else {
        console.log('    (aucune version)');
      }

      // Nettoyer les versions corrompues
      console.log('\n  🧹 Nettoyage des versions corrompues...');
      await langageModel.updateOne(
        { name: langName },
        { $set: { versions: [] } }
      ).exec();

      // Re-synchroniser
      console.log('  🔄 Re-synchronisation...');
      const config = SYNC_LANGAGES.find((c: any) => c.nameInDb === langName);

      if (!config) {
        console.log(`  ❌ Configuration introuvable pour ${langName}`);
        continue;
      }

      if (config.useTags) {
        await service.updateFromGitHubTag(config);
      } else {
        await service.updateFromGitHubRelease(config);
      }

      // État après
      const after = await langageModel.findOne({ name: langName }).exec();
      console.log('\n  Après:');
      if (after?.versions && after.versions.length > 0) {
        after.versions.forEach((v: any) => {
          console.log(`    ${v.type}: ${v.label}`);
        });
        console.log(`\n  ✅ ${langName} corrigé avec succès!`);
      } else {
        console.log('    (aucune version)');
        console.log(`\n  ⚠️ Problème de synchronisation pour ${langName}`);
      }

      console.log('');
    }

  } finally {
    await app.close();
  }
}

fixPerlHaskell().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
