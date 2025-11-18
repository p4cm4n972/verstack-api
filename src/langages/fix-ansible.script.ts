import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixAnsible() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 Correction de la version LTS incorrecte pour Ansible\n');

    const result = await langageModel.updateOne(
      { name: 'Ansible' },
      { $pull: { versions: { type: 'lts' } } }
    ).exec();

    if (result.modifiedCount > 0) {
      console.log('✅ Version LTS supprimée avec succès pour Ansible');

      // Vérifier le résultat
      const ansible = await langageModel.findOne({ name: 'Ansible' }).exec();
      console.log('\nVersions actuelles:');
      (ansible?.versions || []).forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    } else {
      console.log('⚠️  Aucune modification effectuée (LTS déjà absent ou Ansible introuvable)');
    }

  } finally {
    await app.close();
  }
}

fixAnsible().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
