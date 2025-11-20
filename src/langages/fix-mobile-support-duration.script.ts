import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixMobileSupportDuration() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 AJOUT DES SUPPORT DURATION POUR LES OUTILS MOBILE\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Valeurs à appliquer (en mois)
    const supportDurations: Record<string, Record<string, number>> = {
      // Cross-Platform Frameworks
      'React Native': { 'current': 6 },
      'Ionic': { 'current': 12 },
      'Capacitor': { 'current': 12 },

      // Native Frameworks
      'SwiftUI': { 'current': 12 },
      'Jetpack Compose': { 'current': 12 },

      // Backend Mobile
      'Firebase': { 'current': 12 },
      'SQLite': { 'current': 24 },
      'Realm': { 'current': 12 },
      'Supabase': { 'current': 12 },
      'AWS Amplify': { 'current': 12 },

      // Build & Distribution
      'Expo': { 'current': 6 },
      'Fastlane': { 'current': 12 },

      // Frameworks
      'Xamarin': { 'current': 24 },  // Legacy but long support
      '.NET MAUI': { 'current': 18, 'lts': 36 },
      'NativeScript': { 'current': 12 },

      // Flutter State Management
      'Riverpod': { 'current': 6 },
      'BLoC': { 'current': 6 },
      'GetX': { 'current': 6 },

      // Testing
      'Detox': { 'current': 6 },
      'Appium': { 'current': 12 },
      'Maestro': { 'current': 6 }
    };

    let updated = 0;
    let created = 0;

    for (const [toolName, versionDurations] of Object.entries(supportDurations)) {
      const tool = await langageModel.findOne({ name: toolName }).exec();

      if (!tool) {
        console.log(`❌ ${toolName}: Non trouvé`);
        continue;
      }

      let modified = false;

      // Si pas de versions, créer la version current
      if (!tool.versions || tool.versions.length === 0) {
        tool.versions = [];
        for (const [type, duration] of Object.entries(versionDurations)) {
          tool.versions.push({
            type,
            label: 'N/A',
            supportDuration: duration
          });
          console.log(`  ✅ ${toolName} - ${type}: ${duration} mois (créé)`);
          created++;
        }
        modified = true;
      } else {
        // Mettre à jour les versions existantes
        for (const version of tool.versions) {
          const duration = versionDurations[version.type];
          if (duration !== undefined) {
            version.supportDuration = duration;
            console.log(`  ✅ ${toolName} - ${version.type}: ${duration} mois`);
            modified = true;
            updated++;
          }
        }

        // Créer les versions manquantes
        for (const [type, duration] of Object.entries(versionDurations)) {
          if (!tool.versions.find((v: any) => v.type === type)) {
            tool.versions.push({
              type,
              label: 'N/A',
              supportDuration: duration
            });
            console.log(`  ✅ ${toolName} - ${type}: ${duration} mois (créé)`);
            created++;
            modified = true;
          }
        }
      }

      if (modified) {
        await tool.save();
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Versions mises à jour: ${updated}`);
    console.log(`  • Versions créées: ${created}`);

  } finally {
    await app.close();
  }
}

fixMobileSupportDuration().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
