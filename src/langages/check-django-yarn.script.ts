import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkDjangoYarn() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 VÉRIFICATION DE DJANGO ET YARN\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Django
    const django = await langageModel.findOne({ name: 'Django' }).exec();
    if (django) {
      console.log('📦 DJANGO:\n');
      console.log(`  Nom: ${django.name}`);
      console.log(`  Domaines: ${django.domain.join(', ')}`);
      console.log(`  Logo: ${django.logoUrl}`);
      console.log(`  Versions:`);
      if (django.versions && django.versions.length > 0) {
        django.versions.forEach((v: any) => {
          console.log(`    - ${v.type}: ${v.label} (releaseDate: ${v.releaseDate})`);
        });
      } else {
        console.log(`    (aucune version)`);
      }
    } else {
      console.log('❌ Django non trouvé');
    }

    console.log('\n');

    // Yarn
    const yarn = await langageModel.findOne({ name: 'Yarn' }).exec();
    if (yarn) {
      console.log('📦 YARN:\n');
      console.log(`  Nom: ${yarn.name}`);
      console.log(`  Domaines: ${yarn.domain.join(', ')}`);
      console.log(`  Logo: ${yarn.logoUrl}`);
      console.log(`  Versions:`);
      if (yarn.versions && yarn.versions.length > 0) {
        yarn.versions.forEach((v: any) => {
          console.log(`    - ${v.type}: ${v.label} (releaseDate: ${v.releaseDate})`);
        });
      } else {
        console.log(`    (aucune version)`);
      }
    } else {
      console.log('❌ Yarn non trouvé');
    }

    console.log('\n═══════════════════════════════════════════════════════════');

  } finally {
    await app.close();
  }
}

checkDjangoYarn().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
