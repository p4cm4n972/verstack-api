import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Langage } from './entities/langage.entity';

async function fixLivingStandardsSupport() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const langageModel = app.get<Model<Langage>>(getModelToken(Langage.name));

  console.log('🔧 Mise à jour des supportDuration pour livingStandard et edition...\n');

  // Types qui n'ont pas de fin de support définie
  const typesWithoutEndOfLife = ['livingStandard', 'edition', 'standard'];

  const allLanguages = await langageModel.find({}).exec();
  let updatedCount = 0;

  for (const lang of allLanguages) {
    let hasChanges = false;

    for (const version of lang.versions) {
      if (typesWithoutEndOfLife.includes(version.type)) {
        // Mettre supportDuration à 0 pour indiquer qu'il n'y a pas de fin de support
        if (version.supportDuration !== 0) {
          console.log(`  ${lang.name} - ${version.type}: ${version.label}`);
          console.log(`    Ancien supportDuration: ${version.supportDuration ?? 'undefined'}`);
          console.log(`    Nouveau supportDuration: 0 (pas de fin de support)`);

          version.supportDuration = 0;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      await langageModel.updateOne(
        { _id: lang._id },
        { $set: { versions: lang.versions } }
      );
      updatedCount++;
    }
  }

  console.log(`\n✅ ${updatedCount} langages mis à jour`);
  console.log('\nℹ️ Les versions avec supportDuration: 0 afficheront une barre indéterminée (toujours verte)');

  await app.close();
}

fixLivingStandardsSupport().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
