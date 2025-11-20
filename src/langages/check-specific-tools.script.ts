import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkSpecificTools() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    const names = ['GraphQL', 'SwiftUI', 'Jetpack Compose', 'Xamarin', '.NET MAUI'];

    console.log('🔍 VÉRIFICATION DES OUTILS SPÉCIFIQUES\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    for (const name of names) {
      const tool = await langageModel.findOne({ name }).exec();
      if (tool) {
        console.log(`📦 ${name}:`);
        if (tool.versions && tool.versions.length > 0) {
          tool.versions.forEach((v: any) => {
            console.log(`   ${v.type}: "${v.label}"`);
          });
        } else {
          console.log('   ⚠️ Aucune version');
        }
        console.log('');
      } else {
        console.log(`❌ ${name}: NON TROUVÉ\n`);
      }
    }

  } finally {
    await app.close();
  }
}

checkSpecificTools().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
