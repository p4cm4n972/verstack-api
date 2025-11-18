import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function verifySqlJsonUnity() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('✅ VÉRIFICATION FINALE - SQL, JSON, Unity\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // SQL
    const sql = await langageModel.findOne({ name: 'SQL' }).exec();
    console.log('🔹 SQL (Structured Query Language):');
    console.log('─────────────────────────────────────────────────────────');
    if (sql?.versions) {
      sql.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });

      const standardCount = sql.versions.filter((v: any) => v.type === 'standard').length;
      const currentVersion = sql.versions.find((v: any) => v.type === 'current')?.label;
      const standardVersion = sql.versions.find((v: any) => v.type === 'standard')?.label;

      console.log('');
      if (standardCount === 1 && currentVersion === 'SQL:2023' && standardVersion === 'SQL:2023') {
        console.log('  ✅ SQL correct: 1 standard unique (SQL:2023)');
      } else if (standardCount > 1) {
        console.log(`  ❌ SQL: ${standardCount} versions "standard" (duplicates)`);
      } else {
        console.log(`  ⚠️  SQL: current=${currentVersion}, standard=${standardVersion}`);
      }
    } else {
      console.log('  ❌ Aucune version trouvée');
    }

    // JSON
    console.log('\n🔹 JSON (JavaScript Object Notation):');
    console.log('─────────────────────────────────────────────────────────');
    const json = await langageModel.findOne({ name: 'JSON' }).exec();
    if (json?.versions) {
      json.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });

      const livingStandard = json.versions.find((v: any) => v.type === 'livingStandard')?.label;
      console.log('');
      if (livingStandard === 'ECMA-404 / RFC 8259') {
        console.log('  ✅ JSON correct: livingStandard = ECMA-404 / RFC 8259');
      } else {
        console.log(`  ⚠️  JSON: livingStandard = ${livingStandard}`);
      }
    } else {
      console.log('  ❌ Aucune version trouvée');
    }

    // Unity
    console.log('\n🔹 Unity (Game Engine):');
    console.log('─────────────────────────────────────────────────────────');
    const unity = await langageModel.findOne({ name: 'Unity' }).exec();
    if (unity?.versions) {
      unity.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });

      const currentVersion = unity.versions.find((v: any) => v.type === 'current')?.label;
      const ltsVersion = unity.versions.find((v: any) => v.type === 'lts')?.label;

      console.log('');
      if (currentVersion?.startsWith('6000') && ltsVersion?.startsWith('2021.3')) {
        console.log('  ✅ Unity correct:');
        console.log(`      • current = ${currentVersion} (Unity 6)`);
        console.log(`      • lts = ${ltsVersion} (Unity 2021 LTS)`);
      } else {
        console.log(`  ⚠️  Unity: current=${currentVersion}, lts=${ltsVersion}`);
        console.log(`      (attendu: current=6000.x.xfx, lts=2021.3.x)`);
      }
    } else {
      console.log('  ❌ Aucune version trouvée');
    }

    console.log('\n\n💡 RÉSUMÉ');
    console.log('═══════════════════════════════════════════════════════════\n');

    const sqlCheck = sql?.versions?.filter((v: any) => v.type === 'standard').length === 1 &&
                     sql?.versions?.find((v: any) => v.type === 'current')?.label === 'SQL:2023';
    const jsonCheck = json?.versions?.find((v: any) => v.type === 'livingStandard')?.label === 'ECMA-404 / RFC 8259';
    const unityCheck = unity?.versions?.find((v: any) => v.type === 'current')?.label?.startsWith('6000') &&
                       unity?.versions?.find((v: any) => v.type === 'lts')?.label?.startsWith('2021.3');

    console.log(`SQL:   ${sqlCheck ? '✅' : '❌'} ${sqlCheck ? 'Correct' : 'Problème détecté'}`);
    console.log(`JSON:  ${jsonCheck ? '✅' : '❌'} ${jsonCheck ? 'Correct' : 'Problème détecté'}`);
    console.log(`Unity: ${unityCheck ? '✅' : '❌'} ${unityCheck ? 'Correct' : 'Problème détecté'}`);

    if (sqlCheck && jsonCheck && unityCheck) {
      console.log('\n🎉 Tous les langages sont corrects!');
    } else {
      console.log('\n⚠️  Des corrections sont nécessaires');
    }

  } finally {
    await app.close();
  }
}

verifySqlJsonUnity().catch(error => {
  console.error('❌ Erreur lors de la vérification:', error);
  process.exit(1);
});
