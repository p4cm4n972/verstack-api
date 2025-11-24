import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixMaestroAnomaly() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DE L\'ANOMALIE MAESTRO\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const maestro = await langageModel.findOne({ name: 'Maestro' }).exec();

    if (maestro) {
      let modified = false;

      maestro.versions.forEach((v: any) => {
        if (v.label && v.label.startsWith('cli-')) {
          const oldLabel = v.label;
          v.label = v.label.replace(/^cli-/, '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });

      if (modified) {
        await maestro.save();
        console.log('  ✅ Maestro mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ Maestro non trouvé\n');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n✅ Correction appliquée');
    console.log('\n💡 Note: Le normalizeLabel gérera automatiquement les futures versions.');

  } finally {
    await app.close();
  }
}

fixMaestroAnomaly().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
