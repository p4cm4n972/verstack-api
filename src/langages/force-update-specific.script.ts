import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function forceUpdateSpecific() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 MISE À JOUR MANUELLE DES VERSIONS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Yarn: normaliser @yarnpkg/cli/4.11.0 → 4.11.0
    await langageModel.updateOne(
      { name: 'Yarn', 'versions.type': 'current' },
      { $set: { 'versions.$.label': '4.11.0' } }
    );
    console.log('✅ Yarn: 4.11.0');

    // Nginx: enlever le point final
    await langageModel.updateOne(
      { name: 'Nginx', 'versions.type': 'current' },
      { $set: { 'versions.$.label': '1.28.0' } }
    );
    console.log('✅ Nginx: 1.28.0');

    // Django: ajouter current version
    const django = await langageModel.findOne({ name: 'Django' }).exec();
    if (django) {
      const currentExists = django.versions.find((v: any) => v.type === 'current');
      if (!currentExists) {
        await langageModel.updateOne(
          { name: 'Django' },
          {
            $push: {
              versions: {
                type: 'current',
                label: '5.1.5',
                releaseDate: new Date().toISOString(),
                supportDuration: 16
              }
            }
          }
        );
        console.log('✅ Django: current ajouté (5.1.5)');
      }
    }

    // Maestro: normaliser cli-2.0.10 → 2.0.10
    await langageModel.updateOne(
      { name: 'Maestro', 'versions.type': 'current' },
      { $set: { 'versions.$.label': '2.0.10' } }
    );
    console.log('✅ Maestro: 2.0.10');

    // SQLite: version manuelle
    await langageModel.updateOne(
      { name: 'SQLite', 'versions.type': 'current' },
      { $set: { 'versions.$.label': '3.47.2', 'versions.$.releaseDate': new Date().toISOString() } }
    );
    console.log('✅ SQLite: 3.47.2');

    // V: normaliser weekly.2025.47 → 2025.47
    await langageModel.updateOne(
      { name: 'V', 'versions.type': 'current' },
      { $set: { 'versions.$.label': '2025.47' } }
    );
    console.log('✅ V: 2025.47');

    // Perl: version manuelle
    const perl = await langageModel.findOne({ name: 'Perl' }).exec();
    if (perl && perl.versions.length === 0) {
      await langageModel.updateOne(
        { name: 'Perl' },
        {
          $push: {
            versions: {
              type: 'current',
              label: '5.42.0',
              releaseDate: new Date().toISOString(),
              supportDuration: 12
            }
          }
        }
      );
      console.log('✅ Perl: 5.42.0 (recréé)');
    }

    // Haskell: version manuelle
    const haskell = await langageModel.findOne({ name: 'Haskell' }).exec();
    if (haskell && haskell.versions.length === 0) {
      await langageModel.updateOne(
        { name: 'Haskell' },
        {
          $push: {
            versions: {
              type: 'current',
              label: '9.12.2',
              releaseDate: new Date().toISOString(),
              supportDuration: 12
            }
          }
        }
      );
      console.log('✅ Haskell: 9.12.2 (recréé)');
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ Toutes les versions ont été corrigées');

  } finally {
    await app.close();
  }
}

forceUpdateSpecific().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
