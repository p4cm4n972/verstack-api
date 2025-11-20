import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkPerlHaskell() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 VÉRIFICATION DE PERL ET HASKELL\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { SYNC_LANGAGES } = await import('./langage-sync.config');

    for (const langName of ['Perl', 'Haskell']) {
      const lang = await langageModel.findOne({ name: langName }).exec();
      const config = SYNC_LANGAGES.find((c: any) => c.nameInDb === langName);

      console.log(`📋 ${langName}:`);
      console.log('─────────────────────────────────────────────────────────');

      if (config) {
        console.log(`  Config: ${config.sourceType} - ${config.sourceUrl}`);
        console.log(`  useTags: ${config.useTags || false}`);
      } else {
        console.log(`  ⚠️ Configuration introuvable`);
      }

      if (lang?.versions && lang.versions.length > 0) {
        console.log(`  Versions en base:`);
        lang.versions.forEach((v: any) => {
          console.log(`    ${v.type}: ${v.label}`);
          if (v.releaseDate) {
            console.log(`      releaseDate: ${v.releaseDate}`);
          }
        });
      } else {
        console.log(`  ⚠️ Aucune version en base`);
      }

      console.log('');
    }

    // Afficher les derniers tags GitHub pour référence
    console.log('\n📡 Vérification des sources GitHub...\n');

  } finally {
    await app.close();
  }
}

checkPerlHaskell().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
