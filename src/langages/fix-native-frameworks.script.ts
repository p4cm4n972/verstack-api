import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixNativeFrameworks() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES FRAMEWORKS NATIFS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // GraphQL - version actuelle depuis graphql-js
    await langageModel.updateOne(
      { name: 'GraphQL', 'versions.type': 'current' },
      { $set: { 'versions.$.label': '16.10.0' } }
    );
    console.log('✅ GraphQL: 16.10.0');

    // SwiftUI - version liée à iOS 18 / Xcode 16
    await langageModel.updateOne(
      { name: 'SwiftUI', 'versions.type': 'current' },
      { $set: {
        'versions.$.label': '6.0 (iOS 18)',
        'versions.$.releaseDate': new Date('2024-09-16').toISOString()
      } }
    );
    console.log('✅ SwiftUI: 6.0 (iOS 18)');

    // Jetpack Compose - dernière version stable
    await langageModel.updateOne(
      { name: 'Jetpack Compose', 'versions.type': 'current' },
      { $set: {
        'versions.$.label': '1.7.6',
        'versions.$.releaseDate': new Date('2024-11-13').toISOString()
      } }
    );
    console.log('✅ Jetpack Compose: 1.7.6');

    // Xamarin - dernière version avant dépréciation
    await langageModel.updateOne(
      { name: 'Xamarin', 'versions.type': 'current' },
      { $set: {
        'versions.$.label': '17.6 (deprecated)',
        'versions.$.releaseDate': new Date('2024-05-01').toISOString()
      } }
    );
    console.log('✅ Xamarin: 17.6 (deprecated)');

    // .NET MAUI - ajouter LTS
    const maui = await langageModel.findOne({ name: '.NET MAUI' }).exec();
    if (maui) {
      const ltsExists = maui.versions.find((v: any) => v.type === 'lts' && v.label !== 'N/A');
      if (!ltsExists) {
        await langageModel.updateOne(
          { name: '.NET MAUI', 'versions.type': 'lts' },
          { $set: {
            'versions.$.label': '8.0.100',
            'versions.$.releaseDate': new Date('2023-11-14').toISOString()
          } }
        );
        console.log('✅ .NET MAUI LTS: 8.0.100');
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ Frameworks natifs corrigés');

  } finally {
    await app.close();
  }
}

fixNativeFrameworks().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
