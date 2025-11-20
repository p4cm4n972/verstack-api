import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkMobileDomain() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('📱 LANGAGES ET TOOLS DU DOMAINE "MOBILE"\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const mobileItems = await langageModel
      .find({ domain: 'mobile' })
      .sort({ name: 1 })
      .exec();

    // Catégoriser
    const languages: any[] = [];
    const frameworks: any[] = [];
    const tools: any[] = [];
    const others: any[] = [];

    mobileItems.forEach((item: any) => {
      const domains = item.domain || [];
      if (domains.includes('language')) {
        languages.push(item);
      } else if (domains.includes('framework')) {
        frameworks.push(item);
      } else if (domains.includes('tools')) {
        tools.push(item);
      } else {
        others.push(item);
      }
    });

    console.log(`📊 Total: ${mobileItems.length} éléments\n`);

    console.log('🔤 LANGAGES:');
    if (languages.length > 0) {
      languages.forEach((l: any) => {
        const version = l.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${l.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n🏗️ FRAMEWORKS:');
    if (frameworks.length > 0) {
      frameworks.forEach((f: any) => {
        const version = f.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${f.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n🔧 TOOLS:');
    if (tools.length > 0) {
      tools.forEach((t: any) => {
        const version = t.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${t.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n📦 AUTRES:');
    if (others.length > 0) {
      others.forEach((o: any) => {
        const version = o.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${o.name} (${version}) - domains: ${o.domain.join(', ')}`);
      });
    } else {
      console.log('  (aucun)');
    }

    // Suggestions
    console.log('\n\n💡 TECHNOLOGIES MOBILE POPULAIRES À VÉRIFIER:');
    console.log('═══════════════════════════════════════════════════════════\n');

    const existingNames = mobileItems.map((i: any) => i.name.toLowerCase());

    const suggestedMobile = {
      'Langages': ['Swift', 'Kotlin', 'Dart', 'Java', 'Objective-C', 'C#'],
      'Frameworks Cross-Platform': ['Flutter', 'React Native', 'Ionic', 'Xamarin', 'NativeScript', '.NET MAUI', 'Capacitor'],
      'Frameworks Natifs': ['SwiftUI', 'Jetpack Compose', 'UIKit'],
      'State Management': ['Provider', 'Riverpod', 'BLoC', 'GetX', 'MobX'],
      'Backend Mobile': ['Firebase', 'Supabase', 'AWS Amplify', 'Realm', 'SQLite'],
      'Testing': ['XCTest', 'Espresso', 'Detox', 'Appium', 'Maestro'],
      'Build & Distribution': ['Fastlane', 'Expo', 'CodePush', 'App Center'],
      'UI Libraries': ['React Native Paper', 'NativeBase', 'Tamagui']
    };

    for (const [category, items] of Object.entries(suggestedMobile)) {
      const missing = items.filter(item => !existingNames.includes(item.toLowerCase()));
      const present = items.filter(item => existingNames.includes(item.toLowerCase()));

      console.log(`${category}:`);
      if (present.length > 0) {
        console.log(`  ✅ Présents: ${present.join(', ')}`);
      }
      if (missing.length > 0) {
        console.log(`  ❌ Manquants: ${missing.join(', ')}`);
      }
      console.log('');
    }

  } finally {
    await app.close();
  }
}

checkMobileDomain().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
