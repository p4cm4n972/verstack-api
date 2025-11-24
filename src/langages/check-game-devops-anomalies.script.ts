import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkGameDevopsAnomalies() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 VÉRIFICATION DES ANOMALIES GAME/DEVOPS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const items = [
      'Cocos2d-x', 'Unreal Engine', 'GameMaker', 'Godot', 'Blender',
      'PlatformIO', 'Jenkins', 'GitLab CI', 'CircleCI', 'Linkerd',
      'Kustomize', 'Snyk', 'Selenium'
    ];

    for (const itemName of items) {
      const item = await langageModel.findOne({ name: itemName }).exec();

      if (item) {
        console.log(`📦 ${itemName.toUpperCase()}:\n`);
        console.log(`  Nom: ${item.name}`);
        console.log(`  Domaines: ${item.domain.join(', ')}`);
        console.log(`  Logo: ${item.logoUrl}`);
        console.log(`  Versions:`);
        if (item.versions && item.versions.length > 0) {
          item.versions.forEach((v: any) => {
            console.log(`    - ${v.type}: ${v.label} (releaseDate: ${v.releaseDate}, supportDuration: ${v.supportDuration ?? 'N/A'})`);
          });
        } else {
          console.log(`    (aucune version)`);
        }
        console.log('');
      } else {
        console.log(`❌ ${itemName} non trouvé\n`);
      }
    }

    console.log('═══════════════════════════════════════════════════════════');

  } finally {
    await app.close();
  }
}

checkGameDevopsAnomalies().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
