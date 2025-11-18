import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkSqlJsonUnity() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 Analyse de SQL, JSON et Unity\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Récupérer les configurations
    const { SYNC_LANGAGES } = await import('./langage-sync.config');
    const sqlConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'SQL');
    const jsonConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'JSON');
    const unityConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'Unity');

    // Récupérer les versions en base
    const sql = await langageModel.findOne({ name: 'SQL' }).exec();
    const json = await langageModel.findOne({ name: 'JSON' }).exec();
    const unity = await langageModel.findOne({ name: 'Unity' }).exec();

    console.log('📋 CONFIGURATIONS');
    console.log('─────────────────────────────────────────────────────────\n');

    console.log('SQL:');
    console.log(`  sourceType: ${sqlConfig?.sourceType}`);
    console.log(`  sourceUrl: ${sqlConfig?.sourceUrl}`);

    console.log('\nJSON:');
    console.log(`  sourceType: ${jsonConfig?.sourceType}`);
    console.log(`  sourceUrl: ${jsonConfig?.sourceUrl}`);

    console.log('\nUnity:');
    console.log(`  sourceType: ${unityConfig?.sourceType}`);
    console.log(`  sourceUrl: ${unityConfig?.sourceUrl}`);
    console.log(`  ltsSupport: ${unityConfig?.ltsSupport}`);

    console.log('\n\n📊 VERSIONS EN BASE DE DONNÉES');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('🔹 SQL:');
    console.log('─────────────────────────────────────────────────────────');
    if (sql?.versions && sql.versions.length > 0) {
      sql.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    } else {
      console.log('  ⚠️  Aucune version trouvée');
    }

    console.log('\n🔹 JSON:');
    console.log('─────────────────────────────────────────────────────────');
    if (json?.versions && json.versions.length > 0) {
      json.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    } else {
      console.log('  ⚠️  Aucune version trouvée');
    }

    console.log('\n🔹 Unity:');
    console.log('─────────────────────────────────────────────────────────');
    if (unity?.versions && unity.versions.length > 0) {
      unity.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    } else {
      console.log('  ⚠️  Aucune version trouvée');
    }

    console.log('\n\n🔎 ANALYSE DÉTAILLÉE');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Analyse SQL
    console.log('🔹 SQL (Structured Query Language):');
    console.log('─────────────────────────────────────────────────────────');
    const sqlStandard = sql?.versions?.find((v: any) => v.type === 'standard')?.label;
    const sqlCurrent = sql?.versions?.find((v: any) => v.type === 'current')?.label;

    console.log('  Standards SQL ISO:');
    console.log('    • SQL-86 (SQL-87)');
    console.log('    • SQL-89');
    console.log('    • SQL-92');
    console.log('    • SQL:1999');
    console.log('    • SQL:2003');
    console.log('    • SQL:2006');
    console.log('    • SQL:2008');
    console.log('    • SQL:2011');
    console.log('    • SQL:2016');
    console.log('    • SQL:2023 (dernière version)');
    console.log('');

    if (sqlCurrent) {
      if (/SQL:(\d{4})/.test(sqlCurrent)) {
        const year = sqlCurrent.match(/SQL:(\d{4})/)?.[1];
        console.log(`  ✅ Format correct détecté: ${sqlCurrent}`);
        if (year === '2023') {
          console.log(`  ✅ Dernière version (SQL:2023)`);
        } else {
          console.log(`  ⚠️  Version ancienne détectée (dernière: SQL:2023)`);
        }
      } else {
        console.log(`  ⚠️  Format inattendu: ${sqlCurrent}`);
      }
    } else {
      console.log('  ⚠️  Pas de version "current"');
    }

    // Analyse JSON
    console.log('\n🔹 JSON (JavaScript Object Notation):');
    console.log('─────────────────────────────────────────────────────────');
    const jsonLivingStandard = json?.versions?.find((v: any) => v.type === 'livingStandard')?.label;

    console.log('  Standards JSON:');
    console.log('    • RFC 7159 (obsolète)');
    console.log('    • RFC 8259 (actuel, décembre 2017)');
    console.log('    • ECMA-404 (2ème édition, décembre 2017)');
    console.log('');

    if (jsonLivingStandard) {
      console.log(`  📋 livingStandard: ${jsonLivingStandard}`);
      if (jsonLivingStandard.includes('ECMA-404') && jsonLivingStandard.includes('RFC 8259')) {
        console.log(`  ✅ Format correct (référence aux deux standards)`);
      } else {
        console.log(`  ⚠️  Vérifier si les deux standards sont mentionnés`);
      }
    } else {
      console.log('  ⚠️  Pas de livingStandard défini');
    }

    // Analyse Unity
    console.log('\n🔹 Unity (Game Engine):');
    console.log('─────────────────────────────────────────────────────────');
    const unityCurrent = unity?.versions?.find((v: any) => v.type === 'current')?.label;
    const unityLts = unity?.versions?.find((v: any) => v.type === 'lts')?.label;

    console.log('  Format de version Unity:');
    console.log('    • AAAA.M.P[f|a|b]N');
    console.log('    • Année.Majeure.Patch[final|alpha|beta]Build');
    console.log('    • Exemples: 2023.2.5f1, 2022.3.14f1');
    console.log('');

    if (unityCurrent) {
      const isValidFormat = /^\d{4}\.\d+\.\d+[fab]\d+$/.test(unityCurrent);
      console.log(`  📋 current: ${unityCurrent}`);
      if (isValidFormat) {
        console.log(`  ✅ Format correct`);
      } else {
        console.log(`  ⚠️  Format inattendu (attendu: AAAA.M.P[f|a|b]N)`);
      }
    } else {
      console.log('  ⚠️  Pas de version "current"');
    }

    if (unityLts) {
      const isValidFormat = /^\d{4}\.\d+\.\d+[fab]\d+$/.test(unityLts);
      console.log(`  📋 lts: ${unityLts}`);
      if (isValidFormat) {
        console.log(`  ✅ Format correct`);
      } else {
        console.log(`  ⚠️  Format inattendu`);
      }
    } else if (unityConfig?.ltsSupport) {
      console.log('  ⚠️  LTS supporté dans la config mais pas de version en base');
    }

    console.log('\n\n💡 RECOMMANDATIONS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('SQL:');
    if (!sqlCurrent || !sqlCurrent.includes('2023')) {
      console.log('  ⚠️  Mettre à jour vers SQL:2023 (dernière version)');
    } else {
      console.log('  ✅ Versions correctes');
    }

    console.log('\nJSON:');
    if (!jsonLivingStandard) {
      console.log('  ⚠️  Définir livingStandard = "ECMA-404 / RFC 8259"');
    } else {
      console.log('  ✅ Standard correctement défini');
    }

    console.log('\nUnity:');
    if (!unityCurrent) {
      console.log('  ⚠️  Re-synchroniser Unity pour récupérer les versions');
    } else {
      console.log('  ✅ Versions présentes');
    }

  } finally {
    await app.close();
  }
}

checkSqlJsonUnity().catch(error => {
  console.error('❌ Erreur lors de l\'analyse:', error);
  process.exit(1);
});
