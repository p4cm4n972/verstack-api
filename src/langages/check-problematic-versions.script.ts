import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkProblematicVersions() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    const names = [
      'Yarn', 'Nginx', 'Django', 'SwiftUI', 'Jetpack Compose',
      'Xamarin', '.NET MAUI', 'Maestro', 'SQLite', 'V', 'Perl', 'Haskell'
    ];

    console.log('🔍 VÉRIFICATION DES VERSIONS PROBLÉMATIQUES\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    for (const name of names) {
      const tool = await langageModel.findOne({ name }).exec();

      if (!tool) {
        console.log(`❌ ${name}: Non trouvé en base\n`);
        continue;
      }

      console.log(`📦 ${name}:`);
      if (!tool.versions || tool.versions.length === 0) {
        console.log(`   ⚠️ Aucune version\n`);
      } else {
        tool.versions.forEach((v: any) => {
          console.log(`   ${v.type}: "${v.label}"`);
        });
        console.log('');
      }
    }

  } finally {
    await app.close();
  }
}

checkProblematicVersions().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
