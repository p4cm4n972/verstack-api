import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function addMobileEssentials() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('📱 AJOUT DES ESSENTIELS ET IMPORTANTS POUR LE DOMAINE MOBILE\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const mobileItems = [
      // === ESSENTIELS ===
      // Cross-Platform
      {
        name: 'React Native',
        domain: ['mobile', 'frontend', 'framework'],
        description: 'Framework pour créer des applications mobiles natives avec React',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        documentation: 'https://reactnative.dev/docs/getting-started',
        initialRelease: '2015',
        versions: []
      },
      {
        name: 'Ionic',
        domain: ['mobile', 'frontend', 'framework'],
        description: 'Framework pour créer des applications mobiles hybrides avec web technologies',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ionic/ionic-original.svg',
        documentation: 'https://ionicframework.com/docs',
        initialRelease: '2013',
        versions: []
      },
      {
        name: 'Capacitor',
        domain: ['mobile', 'tools'],
        description: 'Runtime natif pour applications web sur iOS, Android et Web',
        logoUrl: 'https://capacitorjs.com/docs/img/logo-light.png',
        documentation: 'https://capacitorjs.com/docs',
        initialRelease: '2019',
        versions: []
      },
      // Natifs
      {
        name: 'SwiftUI',
        domain: ['mobile', 'desktop', 'framework'],
        description: 'Framework déclaratif Apple pour créer des interfaces iOS/macOS',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg',
        documentation: 'https://developer.apple.com/documentation/swiftui',
        initialRelease: '2019',
        versions: []
      },
      {
        name: 'Jetpack Compose',
        domain: ['mobile', 'framework'],
        description: 'Toolkit moderne d\'Android pour créer des UI natives',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg',
        documentation: 'https://developer.android.com/jetpack/compose/documentation',
        initialRelease: '2021',
        versions: []
      },
      // Backend Mobile
      {
        name: 'Firebase',
        domain: ['mobile', 'backend', 'tools'],
        description: 'Plateforme Google pour le développement d\'applications mobiles',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg',
        documentation: 'https://firebase.google.com/docs',
        initialRelease: '2011',
        versions: []
      },
      {
        name: 'SQLite',
        domain: ['mobile', 'database'],
        description: 'Base de données SQL embarquée légère',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg',
        documentation: 'https://www.sqlite.org/docs.html',
        initialRelease: '2000',
        versions: []
      },
      {
        name: 'Realm',
        domain: ['mobile', 'database'],
        description: 'Base de données mobile orientée objets',
        logoUrl: 'https://realm.io/assets/svg/general_logo.svg',
        documentation: 'https://www.mongodb.com/docs/realm/',
        initialRelease: '2014',
        versions: []
      },
      // Build & Distribution
      {
        name: 'Expo',
        domain: ['mobile', 'tools'],
        description: 'Plateforme pour développer des apps React Native universelles',
        logoUrl: 'https://static.expo.dev/static/brand/square-512x512.png',
        documentation: 'https://docs.expo.dev/',
        initialRelease: '2016',
        versions: []
      },
      {
        name: 'Fastlane',
        domain: ['mobile', 'devops', 'tools'],
        description: 'Automatisation du build et déploiement d\'apps mobiles',
        logoUrl: 'https://fastlane.tools/assets/images/fastlane-logo.png',
        documentation: 'https://docs.fastlane.tools/',
        initialRelease: '2014',
        versions: []
      },

      // === IMPORTANTS ===
      // Frameworks
      {
        name: 'Xamarin',
        domain: ['mobile', 'framework'],
        description: 'Framework Microsoft pour créer des apps mobiles en C#',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xamarin/xamarin-original.svg',
        documentation: 'https://learn.microsoft.com/xamarin/',
        initialRelease: '2011',
        versions: []
      },
      {
        name: '.NET MAUI',
        domain: ['mobile', 'desktop', 'framework'],
        description: 'Framework Microsoft multi-plateforme successeur de Xamarin',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg',
        documentation: 'https://learn.microsoft.com/dotnet/maui/',
        initialRelease: '2022',
        versions: []
      },
      {
        name: 'NativeScript',
        domain: ['mobile', 'framework'],
        description: 'Framework pour créer des apps natives avec JavaScript/TypeScript',
        logoUrl: 'https://art.nativescript-vue.org/NativeScript_Logo.png',
        documentation: 'https://docs.nativescript.org/',
        initialRelease: '2015',
        versions: []
      },
      // State Management Flutter
      {
        name: 'Riverpod',
        domain: ['mobile', 'tools'],
        description: 'Solution de state management réactive pour Flutter',
        logoUrl: 'https://riverpod.dev/img/logo.png',
        documentation: 'https://riverpod.dev/docs/introduction/getting_started',
        initialRelease: '2020',
        versions: []
      },
      {
        name: 'BLoC',
        domain: ['mobile', 'tools'],
        description: 'Pattern de state management pour Flutter basé sur les streams',
        logoUrl: 'https://bloclibrary.dev/assets/logo.png',
        documentation: 'https://bloclibrary.dev/',
        initialRelease: '2018',
        versions: []
      },
      {
        name: 'GetX',
        domain: ['mobile', 'tools'],
        description: 'Micro-framework Flutter pour state, navigation et DI',
        logoUrl: 'https://raw.githubusercontent.com/nicksoftware/Flutter/main/flutter_getx_tutorial/packages/get/log_splash.png',
        documentation: 'https://chornthorn.github.io/getx-docs/',
        initialRelease: '2019',
        versions: []
      },
      // Testing
      {
        name: 'Detox',
        domain: ['mobile', 'tools'],
        description: 'Framework de test E2E pour React Native',
        logoUrl: 'https://wix.github.io/Detox/img/DetoxLogo.png',
        documentation: 'https://wix.github.io/Detox/',
        initialRelease: '2016',
        versions: []
      },
      {
        name: 'Appium',
        domain: ['mobile', 'tools'],
        description: 'Framework de test d\'automatisation cross-platform',
        logoUrl: 'https://appium.io/docs/en/latest/assets/images/appium-logo-horiz.png',
        documentation: 'https://appium.io/docs/en/latest/',
        initialRelease: '2012',
        versions: []
      },
      {
        name: 'Maestro',
        domain: ['mobile', 'tools'],
        description: 'Framework de test UI mobile simple et rapide',
        logoUrl: 'https://maestro.mobile.dev/img/logo.png',
        documentation: 'https://maestro.mobile.dev/',
        initialRelease: '2022',
        versions: []
      },
      // Backend
      {
        name: 'Supabase',
        domain: ['mobile', 'web', 'backend', 'database'],
        description: 'Alternative open source à Firebase',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg',
        documentation: 'https://supabase.com/docs',
        initialRelease: '2020',
        versions: []
      },
      {
        name: 'AWS Amplify',
        domain: ['mobile', 'web', 'backend', 'tools'],
        description: 'Plateforme AWS pour développer des apps full-stack',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
        documentation: 'https://docs.amplify.aws/',
        initialRelease: '2017',
        versions: []
      },
      // Update C# domain
      { name: 'C#', addMobileOnly: true }
    ];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of mobileItems) {
      const existing = await langageModel.findOne({ name: item.name }).exec();

      if (existing) {
        if (item.addMobileOnly) {
          if (!existing.domain.includes('mobile')) {
            await langageModel.updateOne(
              { name: item.name },
              { $addToSet: { domain: 'mobile' } }
            ).exec();
            console.log(`  ✅ ${item.name}: domaine 'mobile' ajouté`);
            updated++;
          } else {
            console.log(`  ⏭️  ${item.name}: déjà dans le domaine mobile`);
            skipped++;
          }
        } else {
          const newDomains = [...new Set([...existing.domain, ...(item.domain || [])])];
          if (newDomains.length !== existing.domain.length) {
            await langageModel.updateOne(
              { name: item.name },
              { $set: { domain: newDomains } }
            ).exec();
            console.log(`  ✅ ${item.name}: domaines mis à jour`);
            updated++;
          } else {
            console.log(`  ⏭️  ${item.name}: existe déjà avec les bons domaines`);
            skipped++;
          }
        }
      } else {
        if (!item.addMobileOnly) {
          const newItem = {
            name: item.name,
            domain: item.domain,
            description: item.description || '',
            logoUrl: item.logoUrl || '',
            documentation: item.documentation || '',
            initialRelease: item.initialRelease || '',
            versions: item.versions || [],
            recommendations: 0
          };

          await langageModel.create(newItem);
          console.log(`  ✅ ${item.name}: créé`);
          created++;
        } else {
          console.log(`  ⚠️  ${item.name}: n'existe pas en base`);
          skipped++;
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Créés: ${created}`);
    console.log(`  • Mis à jour: ${updated}`);
    console.log(`  • Ignorés: ${skipped}`);
    console.log(`  • Total traité: ${mobileItems.length}`);

  } finally {
    await app.close();
  }
}

addMobileEssentials().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
