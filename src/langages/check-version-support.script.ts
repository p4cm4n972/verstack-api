import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkVersionSupport() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 VÉRIFICATION DES DURÉES DE SUPPORT PAR VERSION\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const langages = await langageModel.find({}).exec();

    const withSupport: any[] = [];
    const withoutSupport: any[] = [];

    langages.forEach((lang: any) => {
      if (lang.versions && lang.versions.length > 0) {
        lang.versions.forEach((v: any) => {
          const entry = {
            language: lang.name,
            versionType: v.type,
            versionLabel: v.label,
            supportDuration: v.supportDuration,
            releaseDate: v.releaseDate,
            endSupport: v.endSupport
          };

          if (v.supportDuration !== undefined && v.supportDuration !== null) {
            withSupport.push(entry);
          } else {
            withoutSupport.push(entry);
          }
        });
      }
    });

    console.log(`📊 STATISTIQUES:`);
    console.log(`─────────────────────────────────────────────────────────`);
    console.log(`  Total langages: ${langages.length}`);
    console.log(`  Total versions: ${withSupport.length + withoutSupport.length}`);
    console.log(`  Versions avec supportDuration: ${withSupport.length}`);
    console.log(`  Versions sans supportDuration: ${withoutSupport.length}\n`);

    if (withSupport.length > 0) {
      console.log('📋 VERSIONS AVEC DURÉE DE SUPPORT:');
      console.log('═══════════════════════════════════════════════════════════\n');

      const grouped = withSupport.reduce((acc: any, v) => {
        if (!acc[v.language]) acc[v.language] = [];
        acc[v.language].push(v);
        return acc;
      }, {});

      Object.keys(grouped).sort().forEach((langName) => {
        console.log(`🔹 ${langName}:`);
        grouped[langName].forEach((v: any) => {
          console.log(`   ${v.versionType}: ${v.versionLabel}`);
          console.log(`      supportDuration: ${v.supportDuration} ${typeof v.supportDuration === 'number' ? 'jours' : ''}`);
          if (v.releaseDate) console.log(`      releaseDate: ${v.releaseDate}`);
          if (v.endSupport) console.log(`      endSupport: ${v.endSupport}`);
        });
        console.log('');
      });
    }

    console.log('\n📋 EXEMPLES DE VERSIONS SANS DURÉE DE SUPPORT:');
    console.log('─────────────────────────────────────────────────────────\n');

    const grouped = withoutSupport.reduce((acc: any, v) => {
      if (!acc[v.language]) acc[v.language] = [];
      acc[v.language].push(v);
      return acc;
    }, {});

    // Afficher les 10 premiers langages
    Object.keys(grouped).sort().slice(0, 10).forEach((langName) => {
      console.log(`🔹 ${langName}:`);
      grouped[langName].forEach((v: any) => {
        console.log(`   ${v.versionType}: ${v.versionLabel}${v.releaseDate ? ` (${v.releaseDate})` : ''}`);
      });
    });

    console.log(`\n... et ${Math.max(0, Object.keys(grouped).length - 10)} autres langages\n`);

    console.log('\n💡 DURÉES DE SUPPORT RECOMMANDÉES:');
    console.log('═══════════════════════════════════════════════════════════\n');

    const recommendations: Record<string, { lts?: string; current?: string; note: string }> = {
      'Node.js': {
        lts: '3 ans (30 mois active + 18 mois maintenance)',
        current: '6 mois (jusqu\'à la prochaine LTS)',
        note: 'Support bien défini par la Node.js Foundation'
      },
      'Python': {
        lts: '5 ans',
        current: '5 ans',
        note: 'Chaque version majeure/mineure supportée ~5 ans'
      },
      'Java': {
        lts: '8+ ans (Oracle LTS) / variable (OpenJDK)',
        current: '6 mois',
        note: 'Java 8, 11, 17, 21 sont LTS'
      },
      'PHP': {
        current: '3 ans (2 active + 1 security)',
        note: '2 ans Active Support + 1 an Security Support'
      },
      '.NET': {
        lts: '3 ans',
        current: '18 mois',
        note: 'LTS vs Current (STS)'
      },
      'Ruby': {
        current: '3 ans',
        note: 'Normal maintenance pendant ~3 ans'
      },
      'Go': {
        current: '1 an',
        note: 'Seules les 2 dernières versions majeures'
      },
      'Angular': {
        lts: '18 mois (6 active + 12 LTS)',
        note: 'Versions paires sont LTS'
      },
      'Vue.js': {
        current: '18 mois',
        note: 'Support des versions majeures'
      },
      'Unity': {
        lts: '2 ans',
        note: 'Versions LTS seulement'
      },
      'PostgreSQL': {
        current: '5 ans',
        note: 'Chaque version majeure'
      },
      'MySQL': {
        current: '5-8 ans',
        note: 'Dépend de la version (5.x vs 8.x)'
      },
      'MariaDB': {
        current: '5 ans',
        note: 'Support à long terme'
      }
    };

    Object.entries(recommendations).forEach(([lang, info]) => {
      console.log(`🔹 ${lang}:`);
      if (info.lts) console.log(`   LTS: ${info.lts}`);
      if (info.current) console.log(`   Current: ${info.current}`);
      console.log(`   Note: ${info.note}`);
      console.log('');
    });

    console.log('\n💭 QUESTIONS À RÉSOUDRE:');
    console.log('─────────────────────────────────────────────────────────');
    console.log('  1. Faut-il ajouter supportDuration pour toutes les versions ?');
    console.log('  2. Format: nombre de jours ? ou texte (ex: "3 years") ?');
    console.log('  3. Le schéma montre: supportDuration?: number (en jours)');
    console.log('  4. Faut-il aussi calculer endSupport automatiquement ?');
    console.log('     (endSupport = releaseDate + supportDuration)');

  } finally {
    await app.close();
  }
}

checkVersionSupport().catch(error => {
  console.error('❌ Erreur lors de la vérification:', error);
  process.exit(1);
});
