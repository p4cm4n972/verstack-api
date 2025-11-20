import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixMissingReleaseDates() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES releaseDate MANQUANTES\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Find all documents with versions that have missing releaseDate
    const allLangages = await langageModel.find({}).exec();

    let fixed = 0;

    for (const langage of allLangages) {
      if (!langage.versions || langage.versions.length === 0) continue;

      let modified = false;

      for (const version of langage.versions) {
        if (!version.releaseDate) {
          version.releaseDate = new Date().toISOString();
          console.log(`  ✅ ${langage.name} - ${version.type}: releaseDate ajoutée`);
          modified = true;
          fixed++;
        }
      }

      if (modified) {
        await langage.save();
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 ${fixed} releaseDate corrigées`);

  } finally {
    await app.close();
  }
}

fixMissingReleaseDates().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
