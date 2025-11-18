import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function syncLtsChanges() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 SYNCHRONISATION DES CHANGEMENTS LTS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    let cleanedCount = 0;

    // 1. Supprimer les versions LTS pour Python et PostgreSQL
    console.log('📋 ÉTAPE 1: Suppression des versions LTS incorrectes\n');

    const toClean = ['Python', 'PostgreSQL'];

    for (const langName of toClean) {
      const lang = await langageModel.findOne({ name: langName }).exec();

      if (!lang) {
        console.log(`⚠️  ${langName}: Langage introuvable`);
        continue;
      }

      const ltsVersion = lang.versions?.find((v: any) => v.type === 'lts');

      if (ltsVersion) {
        // Supprimer la version LTS
        const newVersions = lang.versions.filter((v: any) => v.type !== 'lts');

        await langageModel.updateOne(
          { name: langName },
          { $set: { versions: newVersions } }
        ).exec();

        console.log(`✅ ${langName}:`);
        console.log(`   Supprimé: lts = ${ltsVersion.label}`);
        cleanedCount++;
      } else {
        console.log(`✅ ${langName}: Pas de version LTS à supprimer`);
      }
    }

    console.log(`\n   Total nettoyé: ${cleanedCount}\n`);

    // 2. Afficher ce qu'il faut pour les nouvelles LTS
    console.log('\n📋 ÉTAPE 2: Langages nécessitant des versions LTS\n');
    console.log('─────────────────────────────────────────────────────────\n');

    const needLts = [
      {
        name: 'Laravel',
        currentLts: '11.x',
        note: 'Versions LTS: 6.x (EOL), 9.x (EOL), 11.x (current LTS)',
        action: 'Nécessite un custom updater pour détecter la LTS depuis les tags GitHub'
      },
      {
        name: 'C#',
        currentLts: '.NET 8 (C# 12)',
        note: 'Suit .NET - LTS: .NET 6 (C# 10), .NET 8 (C# 12)',
        action: 'Nécessite logique pour mapper version .NET → version C#'
      },
      {
        name: 'Symfony',
        currentLts: '6.4 ou 7.2',
        note: 'Versions LTS: 4.4, 5.4, 6.4, 7.2',
        action: 'Les versions .4 ou .2 sont généralement LTS'
      },
      {
        name: 'Django',
        currentLts: '4.2 ou 5.2',
        note: 'Versions LTS: 2.2, 3.2, 4.2, 5.2',
        action: 'Les versions .2 sont LTS - peut utiliser ltsTagPrefix existant'
      }
    ];

    for (const lang of needLts) {
      console.log(`🔹 ${lang.name}:`);
      console.log(`   LTS actuelle: ${lang.currentLts}`);
      console.log(`   Note: ${lang.note}`);
      console.log(`   Action: ${lang.action}`);
      console.log('');
    }

    console.log('\n💡 RÉSUMÉ:');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`  ✅ Versions LTS supprimées: ${cleanedCount}`);
    console.log(`  ⚠️  Versions LTS à ajouter: ${needLts.length}`);
    console.log('\nNote: Pour ajouter les versions LTS manquantes, il faudrait:');
    console.log('  1. Créer des custom updaters pour Laravel, C#');
    console.log('  2. Améliorer la logique GitHub pour Symfony (versions .4/.2)');
    console.log('  3. Django devrait fonctionner avec ltsTagPrefix: "4.2"');

  } finally {
    await app.close();
  }
}

syncLtsChanges().catch(error => {
  console.error('❌ Erreur lors de la synchronisation:', error);
  process.exit(1);
});
