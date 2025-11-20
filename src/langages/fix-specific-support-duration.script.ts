import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixSpecificSupportDuration() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES SUPPORT DURATION\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Valeurs à appliquer (en mois)
    const corrections: Record<string, Record<string, number>> = {
      'Laravel': {
        'current': 12,   // 1 an de bug fixes
        'lts': 36        // 2 ans bug fixes + 1 an security
      },
      'Django': {
        'current': 16,   // 16 mois
        'lts': 36        // 3 ans
      },
      'Python': {
        'current': 60    // 5 ans (18 mois bug fixes + 42 mois security)
      },
      'C#': {
        'current': 18,   // STS - 18 mois
        'lts': 36        // LTS - 3 ans
      },
      'Symfony': {
        'current': 8,    // 8 mois
        'lts': 36        // 3 ans
      },
      'MongoDB': {
        'current': 12    // ~12 mois par version majeure
      }
    };

    let updated = 0;

    for (const [langName, versionDurations] of Object.entries(corrections)) {
      const lang = await langageModel.findOne({ name: langName }).exec();

      if (!lang) {
        console.log(`❌ ${langName}: Non trouvé`);
        continue;
      }

      console.log(`📋 ${langName}:`);

      let modified = false;

      for (const version of lang.versions) {
        const duration = versionDurations[version.type];

        if (duration !== undefined) {
          version.supportDuration = duration;
          console.log(`  ✅ ${version.type}: ${duration} mois`);
          modified = true;
        }
      }

      if (modified) {
        await lang.save();
        updated++;
      }

      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé: ${updated} langages mis à jour`);

  } finally {
    await app.close();
  }
}

fixSpecificSupportDuration().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
