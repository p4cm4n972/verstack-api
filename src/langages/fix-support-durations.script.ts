import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixSupportDurations() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES DURÉES DE SUPPORT\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const corrections = [
      // Valeurs incorrectes à corriger
      {
        language: 'Angular',
        versionType: 'lts',
        from: 12,
        to: 18,
        reason: '6 mois Active + 12 mois LTS = 18 mois total'
      },
      {
        language: 'Vue.js',
        versionType: 'current',
        from: 24,
        to: 18,
        reason: 'Versions majeures: ~18 mois'
      },
      {
        language: 'Rust',
        versionType: 'current',
        from: 6,
        to: 1.5,
        reason: 'Rolling release: 6 semaines = 1.5 mois'
      },
      {
        language: 'PHP',
        versionType: 'current',
        from: 24,
        to: 36,
        reason: '24 mois Active + 12 mois Security = 36 mois'
      },
      {
        language: 'Ruby',
        versionType: 'current',
        from: 18,
        to: 36,
        reason: 'Normal maintenance: 3 ans = 36 mois'
      },
      {
        language: 'Node.js',
        versionType: 'current',
        from: 8,
        to: 6,
        reason: '~6 mois jusqu\'à la prochaine LTS'
      },
      {
        language: 'MySQL',
        versionType: 'current',
        from: 60,
        to: 96,
        reason: 'MySQL 8.x: 8 ans = 96 mois'
      }
    ];

    const additions = [
      // Valeurs manquantes à ajouter
      {
        language: 'Java',
        versionType: 'lts',
        value: 96,
        reason: 'LTS: 8 ans minimum (Oracle)'
      },
      {
        language: 'Django',
        versionType: 'lts',
        value: 36,
        reason: 'LTS: 3 ans = 36 mois'
      },
      {
        language: 'Unity',
        versionType: 'current',
        value: 12,
        reason: 'Tech stream: ~12 mois'
      },
      {
        language: 'Unity',
        versionType: 'lts',
        value: 24,
        reason: 'LTS: 2 ans = 24 mois'
      },
      {
        language: 'Laravel',
        versionType: 'lts',
        value: 24,
        reason: 'LTS: 24 mois bugfix (+ 36 mois security)'
      },
      {
        language: 'Symfony',
        versionType: 'lts',
        value: 48,
        reason: 'LTS: 4 ans = 48 mois'
      }
    ];

    let correctionCount = 0;
    let additionCount = 0;

    console.log('📝 CORRECTIONS (valeurs incorrectes):\n');

    for (const correction of corrections) {
      const lang = await langageModel.findOne({ name: correction.language }).exec();
      if (!lang) {
        console.log(`⚠️  ${correction.language}: langage introuvable`);
        continue;
      }

      const versionIndex = lang.versions.findIndex((v: any) => v.type === correction.versionType);
      if (versionIndex === -1) {
        console.log(`⚠️  ${correction.language} (${correction.versionType}): version introuvable`);
        continue;
      }

      // Mettre à jour la durée de support
      lang.versions[versionIndex].supportDuration = correction.to;

      await langageModel.updateOne(
        { name: correction.language },
        { $set: { versions: lang.versions } }
      ).exec();

      console.log(`✅ ${correction.language} (${correction.versionType}):`);
      console.log(`   ${correction.from} mois → ${correction.to} mois`);
      console.log(`   Raison: ${correction.reason}\n`);
      correctionCount++;
    }

    console.log('\n📝 AJOUTS (valeurs manquantes):\n');

    for (const addition of additions) {
      const lang = await langageModel.findOne({ name: addition.language }).exec();
      if (!lang) {
        console.log(`⚠️  ${addition.language}: langage introuvable`);
        continue;
      }

      const versionIndex = lang.versions.findIndex((v: any) => v.type === addition.versionType);
      if (versionIndex === -1) {
        console.log(`⚠️  ${addition.language} (${addition.versionType}): version introuvable`);
        continue;
      }

      // Ajouter la durée de support
      lang.versions[versionIndex].supportDuration = addition.value;

      await langageModel.updateOne(
        { name: addition.language },
        { $set: { versions: lang.versions } }
      ).exec();

      console.log(`✅ ${addition.language} (${addition.versionType}):`);
      console.log(`   Ajout: ${addition.value} mois`);
      console.log(`   Raison: ${addition.reason}\n`);
      additionCount++;
    }

    console.log('\n💡 RÉSUMÉ:');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`  Corrections effectuées: ${correctionCount}/${corrections.length}`);
    console.log(`  Ajouts effectués: ${additionCount}/${additions.length}`);
    console.log(`  Total modifications: ${correctionCount + additionCount}`);

    if (correctionCount + additionCount === corrections.length + additions.length) {
      console.log('\n🎉 Toutes les durées de support ont été corrigées!');
    } else {
      console.log('\n⚠️  Certaines modifications n\'ont pas pu être effectuées');
    }

  } finally {
    await app.close();
  }
}

fixSupportDurations().catch(error => {
  console.error('❌ Erreur lors de la correction:', error);
  process.exit(1);
});
