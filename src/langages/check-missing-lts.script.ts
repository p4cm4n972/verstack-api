import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkMissingLts() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 VÉRIFICATION DES VERSIONS LTS MANQUANTES\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const languagesToCheck = ['Java', 'Django', 'Laravel', 'Symfony'];

    for (const langName of languagesToCheck) {
      const lang = await langageModel.findOne({ name: langName }).exec();

      console.log(`🔹 ${langName}:`);
      console.log('─────────────────────────────────────────────────────────');

      if (!lang) {
        console.log('  ❌ Langage introuvable en base\n');
        continue;
      }

      console.log(`  Versions en base:`);
      if (lang.versions && lang.versions.length > 0) {
        lang.versions.forEach((v: any) => {
          console.log(`    • ${v.type}: ${v.label}${v.supportDuration ? ` (${v.supportDuration} mois)` : ''}`);
        });
      } else {
        console.log('    (aucune version)');
      }

      const hasLts = lang.versions?.some((v: any) => v.type === 'lts');
      if (!hasLts) {
        console.log(`\n  ⚠️  Pas de version LTS définie`);
        console.log(`  💡 Action: Vérifier la config dans langage-sync.config.ts`);
      }

      console.log('');
    }

    // Vérifier la config
    console.log('\n📋 CONFIGURATION DANS langage-sync.config.ts:');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { SYNC_LANGAGES } = await import('./langage-sync.config');

    for (const langName of languagesToCheck) {
      const config = SYNC_LANGAGES.find((c: any) => c.nameInDb === langName);

      if (config) {
        console.log(`🔹 ${langName}:`);
        console.log(`   ltsSupport: ${config.ltsSupport || false}`);
        console.log(`   sourceType: ${config.sourceType}`);
        if (config.sourceUrl) console.log(`   sourceUrl: ${config.sourceUrl}`);
        console.log('');
      }
    }

    console.log('\n💡 RECOMMANDATIONS:');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Pour ajouter le support LTS:');
    console.log('  1. Java: Ajouter ltsSupport: true dans la config');
    console.log('     → Java a des versions LTS (8, 11, 17, 21, ...)');
    console.log('  2. Django: Ajouter ltsSupport: true dans la config');
    console.log('     → Django a des versions LTS (2.2, 3.2, 4.2, ...)');
    console.log('  3. Laravel: Ajouter ltsSupport: true dans la config');
    console.log('     → Laravel a des versions LTS (6.x, 9.x, 11.x, ...)');
    console.log('  4. Symfony: Ajouter ltsSupport: true dans la config');
    console.log('     → Symfony a des versions LTS (4.4, 5.4, 6.4, 7.2, ...)');

  } finally {
    await app.close();
  }
}

checkMissingLts().catch(error => {
  console.error('❌ Erreur lors de la vérification:', error);
  process.exit(1);
});
