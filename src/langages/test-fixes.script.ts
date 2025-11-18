import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function testFixes() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);

    console.log('🧪 Test des corrections de parsing...\n');
    console.log('Langages à tester : Flutter, C++, Perl, Haskell, Django\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Synchroniser uniquement les langages corrigés
    const languagesToTest = ['Flutter', 'C++', 'Perl', 'Haskell', 'Django'];

    const { SYNC_LANGAGES } = await import('./langage-sync.config');
    const configsToTest = SYNC_LANGAGES.filter(lang =>
      languagesToTest.includes(lang.nameInDb)
    );

    for (const config of configsToTest) {
      console.log(`\n🔄 Synchronisation de ${config.nameInDb}...`);
      console.log('─────────────────────────────────────────────────────────');

      try {
        switch (config.sourceType) {
          case 'npm':
            await service.updateFromNpm(config);
            break;
          case 'github':
            if (config.useTags) {
              await service.updateFromGitHubTag(config);
            } else {
              await service.updateFromGitHubRelease(config);
            }
            break;
          case 'custom':
            await service.updateCustom(config);
            break;
        }

        console.log(`✅ ${config.nameInDb} synchronisé avec succès`);
      } catch (error: any) {
        console.error(`❌ Erreur pour ${config.nameInDb}:`, error.message);
      }
    }

    console.log('\n\n📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Vérification des versions en base de données...\n');

    // Lire les versions depuis la DB
    const langageModel = app.get<Model<any>>('LangageModel');

    for (const langName of languagesToTest) {
      const langage = await langageModel.findOne({ name: langName }).exec();

      if (!langage) {
        console.log(`⚠️  ${langName} - Introuvable en base`);
        continue;
      }

      console.log(`\n${langName}:`);

      for (const version of langage.versions || []) {
        console.log(`  ${version.type}: ${version.label}`);
      }
    }

    console.log('\n\n✅ Test terminé !');

  } finally {
    await app.close();
  }
}

testFixes().catch(error => {
  console.error('❌ Erreur lors du test:', error);
  process.exit(1);
});
