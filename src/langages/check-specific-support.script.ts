import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkSpecificSupport() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 VÉRIFICATION SUPPORT DURATION - LANGAGES SPÉCIFIQUES\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const toCheck = ['Laravel', 'Django', 'Python', 'C#', 'Symfony', 'MongoDB'];

    for (const name of toCheck) {
      const lang = await langageModel.findOne({ name }).exec();

      console.log(`📋 ${name}:`);
      console.log('─────────────────────────────────────────────────────────');

      if (!lang) {
        console.log('  ❌ Non trouvé en base\n');
        continue;
      }

      if (!lang.versions || lang.versions.length === 0) {
        console.log('  ⚠️ Aucune version\n');
        continue;
      }

      lang.versions.forEach((v: any) => {
        const duration = v.supportDuration;
        const hasDuration = duration !== undefined && duration !== null;

        console.log(`  ${v.type}: ${v.label}`);
        if (hasDuration) {
          console.log(`    supportDuration: ${duration} mois (${(duration / 12).toFixed(1)} ans)`);
        } else {
          console.log(`    supportDuration: ❌ NON DÉFINI`);
        }
      });

      console.log('');
    }

    // Valeurs officielles de référence
    console.log('\n📚 VALEURS OFFICIELLES DE RÉFÉRENCE:');
    console.log('═══════════════════════════════════════════════════════════\n');

    const officialValues = {
      'Laravel': {
        current: '12 mois (1 an de bug fixes)',
        lts: '24 mois (2 ans de bug fixes) + 12 mois security = 36 mois total'
      },
      'Django': {
        current: '16 mois',
        lts: '36 mois (3 ans)'
      },
      'Python': {
        current: '18 mois de bug fixes + 42 mois security = 60 mois total (5 ans)'
      },
      'C#': {
        current: '18 mois (STS - Standard Term Support)',
        lts: '36 mois (3 ans LTS)'
      },
      'Symfony': {
        current: '8 mois',
        lts: '36 mois (3 ans)'
      },
      'MongoDB': {
        current: '12 mois environ par version majeure'
      }
    };

    for (const [name, values] of Object.entries(officialValues)) {
      console.log(`${name}:`);
      for (const [type, duration] of Object.entries(values)) {
        console.log(`  ${type}: ${duration}`);
      }
      console.log('');
    }

  } finally {
    await app.close();
  }
}

checkSpecificSupport().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
