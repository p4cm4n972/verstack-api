import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkMobileVersions() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 VÉRIFICATION DES VERSIONS DES OUTILS MOBILE\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const mobileTools = [
      'React Native', 'Ionic', 'Capacitor', 'SwiftUI', 'Jetpack Compose',
      'Firebase', 'SQLite', 'Realm', 'Supabase', 'AWS Amplify',
      'Expo', 'Fastlane', 'Xamarin', '.NET MAUI', 'NativeScript',
      'Riverpod', 'BLoC', 'GetX', 'Detox', 'Appium', 'Maestro'
    ];

    let issues = 0;

    for (const name of mobileTools) {
      const tool = await langageModel.findOne({ name }).exec();

      if (!tool) {
        console.log(`❌ ${name}: Non trouvé`);
        issues++;
        continue;
      }

      if (!tool.versions || tool.versions.length === 0) {
        console.log(`⚠️ ${name}: Pas de versions`);
        issues++;
        continue;
      }

      for (const version of tool.versions) {
        const hasLabel = version.label && version.label !== 'N/A';
        const hasReleaseDate = version.releaseDate;
        const hasSupportDuration = typeof version.supportDuration === 'number';

        if (!hasLabel || !hasReleaseDate) {
          console.log(`⚠️ ${name} - ${version.type}:`);
          console.log(`   label: ${version.label || '(missing)'}`);
          console.log(`   releaseDate: ${version.releaseDate || '(missing)'}`);
          console.log(`   supportDuration: ${version.supportDuration ?? '(missing)'}`);
          issues++;
        }
      }
    }

    if (issues === 0) {
      console.log('✅ Toutes les versions sont complètes');
    } else {
      console.log(`\n❌ ${issues} problèmes trouvés`);
    }

  } finally {
    await app.close();
  }
}

checkMobileVersions().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
