import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkSpecific() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    const langs = await langageModel.find({
      name: { $in: ['Ansible', 'Haskell', 'Julia'] }
    }).exec();

    console.log('📋 Vérification des valeurs en base de données\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    for (const lang of langs) {
      console.log(`${lang.name}:`);
      (lang.versions || []).forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
      console.log('');
    }

  } finally {
    await app.close();
  }
}

checkSpecific().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
