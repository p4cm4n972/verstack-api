import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkSupportDuration() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 VÉRIFICATION DES DURÉES DE SUPPORT\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Récupérer tous les langages
    const langages = await langageModel.find({}).exec();

    const withSupport: any[] = [];
    const withoutSupport: any[] = [];

    langages.forEach((lang: any) => {
      if (lang.supportDuration) {
        withSupport.push({
          name: lang.name,
          supportDuration: lang.supportDuration,
          versions: lang.versions?.map((v: any) => `${v.type}: ${v.label}`).join(', ') || 'N/A'
        });
      } else {
        withoutSupport.push(lang.name);
      }
    });

    console.log(`📊 STATISTIQUES:`);
    console.log(`─────────────────────────────────────────────────────────`);
    console.log(`  Total langages: ${langages.length}`);
    console.log(`  Avec supportDuration: ${withSupport.length}`);
    console.log(`  Sans supportDuration: ${withoutSupport.length}\n`);

    console.log('📋 LANGAGES AVEC DURÉE DE SUPPORT:');
    console.log('═══════════════════════════════════════════════════════════\n');

    withSupport
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((lang) => {
        console.log(`🔹 ${lang.name}`);
        console.log(`   supportDuration: ${lang.supportDuration}`);
        console.log(`   versions: ${lang.versions}`);
        console.log('');
      });

    if (withoutSupport.length > 0) {
      console.log('\n📋 LANGAGES SANS DURÉE DE SUPPORT:');
      console.log('─────────────────────────────────────────────────────────');
      withoutSupport.sort().forEach((name) => {
        console.log(`  • ${name}`);
      });
    }

    console.log('\n\n💡 ANALYSE ET RECOMMANDATIONS:');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Vérifications connues
    const knownDurations: Record<string, { expected: string; note: string }> = {
      'Node.js': {
        expected: '3 years (LTS versions)',
        note: 'LTS versions have 30 months Active + 18 months Maintenance = ~3 years total'
      },
      'Python': {
        expected: '5 years',
        note: 'Each major version supported for ~5 years from initial release'
      },
      'Java': {
        expected: '6 months to 6+ years (LTS)',
        note: 'Non-LTS: 6 months, LTS: minimum 8 years (Oracle) or longer (OpenJDK)'
      },
      'PHP': {
        expected: '3 years (2 active + 1 security)',
        note: '2 years Active Support + 1 year Security Support'
      },
      '.NET': {
        expected: '3 years (LTS)',
        note: 'LTS versions supported for 3 years'
      },
      'Go': {
        expected: '~1 year',
        note: 'Only last 2 major versions supported (~1 year total)'
      },
      'Ruby': {
        expected: '~3 years',
        note: 'Normal maintenance ends after ~3 years'
      },
      'Rust': {
        expected: '6 weeks (rolling)',
        note: 'No LTS, new stable every 6 weeks, only current version supported'
      },
      'TypeScript': {
        expected: 'N/A (rolling)',
        note: 'No formal LTS, frequent releases'
      },
      'Kotlin': {
        expected: 'N/A (rolling)',
        note: 'No formal LTS policy'
      },
      'Swift': {
        expected: 'N/A (rolling)',
        note: 'Only current version officially supported'
      },
      'Unity': {
        expected: '2 years (LTS)',
        note: 'LTS versions supported for 2 years'
      },
      'Angular': {
        expected: '18 months',
        note: '6 months active + 12 months LTS'
      },
      'React': {
        expected: 'N/A (rolling)',
        note: 'No formal support policy'
      },
      'Vue.js': {
        expected: '18 months',
        note: 'Major versions supported for ~18 months'
      }
    };

    withSupport.forEach((lang) => {
      const known = knownDurations[lang.name];
      if (known) {
        console.log(`🔹 ${lang.name}:`);
        console.log(`   En base: ${lang.supportDuration}`);
        console.log(`   Attendu: ${known.expected}`);

        if (lang.supportDuration === known.expected ||
            lang.supportDuration.includes(known.expected.split(' ')[0])) {
          console.log(`   ✅ Correct`);
        } else {
          console.log(`   ⚠️  À vérifier - ${known.note}`);
        }
        console.log('');
      }
    });

    // Langages qui devraient avoir une durée de support
    const shouldHaveSupport = [
      'Node.js', 'Python', 'Java', 'PHP', '.NET', 'Ruby', 'Go',
      'Angular', 'Vue.js', 'Ubuntu', 'Debian', 'RedHat', 'Unity'
    ];

    const missingSupportDuration = shouldHaveSupport.filter(
      name => withoutSupport.includes(name)
    );

    if (missingSupportDuration.length > 0) {
      console.log('\n⚠️  LANGAGES QUI DEVRAIENT AVOIR UNE DURÉE DE SUPPORT:');
      console.log('─────────────────────────────────────────────────────────');
      missingSupportDuration.forEach((name) => {
        const info = knownDurations[name];
        console.log(`  • ${name}: ${info?.expected || 'à définir'}`);
        if (info?.note) {
          console.log(`    → ${info.note}`);
        }
      });
    }

  } finally {
    await app.close();
  }
}

checkSupportDuration().catch(error => {
  console.error('❌ Erreur lors de la vérification:', error);
  process.exit(1);
});
