import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function fixCDuplicates() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');
    const service = app.get(LangageUpdateOptimizedService);

    console.log('🔧 Correction des doublons pour le langage C\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 1. Afficher l'état actuel
    const cBefore = await langageModel.findOne({ name: 'C' }).exec();
    console.log('📋 État AVANT nettoyage:');
    console.log('─────────────────────────────────────────────────────────');
    if (cBefore?.versions) {
      cBefore.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    }
    console.log('');

    // 2. Supprimer TOUTES les versions "standard" existantes
    console.log('🗑️  Suppression de tous les doublons "standard"...');
    await langageModel.updateOne(
      { name: 'C' },
      { $pull: { versions: { type: 'standard' } } }
    ).exec();
    console.log('✅ Doublons supprimés\n');

    // 3. Re-synchroniser C pour recréer la version standard correctement
    console.log('🔄 Re-synchronisation du langage C...');
    const { SYNC_LANGAGES } = await import('./langage-sync.config');
    const cConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'C');

    if (cConfig) {
      await service.updateCustom(cConfig);
      console.log('');
    } else {
      console.log('❌ Configuration C introuvable\n');
    }

    // 4. Afficher l'état final
    const cAfter = await langageModel.findOne({ name: 'C' }).exec();
    console.log('📊 État APRÈS correction:');
    console.log('─────────────────────────────────────────────────────────');
    if (cAfter?.versions) {
      cAfter.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    }
    console.log('');

    // 5. Validation
    const standardCount = cAfter?.versions?.filter((v: any) => v.type === 'standard').length || 0;
    const currentVersion = cAfter?.versions?.find((v: any) => v.type === 'current')?.label;
    const standardVersion = cAfter?.versions?.find((v: any) => v.type === 'standard')?.label;

    console.log('✅ VALIDATION:');
    console.log('─────────────────────────────────────────────────────────');
    if (standardCount === 1) {
      console.log(`  ✅ Une seule entrée "standard": ${standardVersion}`);
    } else {
      console.log(`  ❌ Nombre d'entrées "standard": ${standardCount} (attendu: 1)`);
    }

    if (currentVersion === 'C23') {
      console.log(`  ✅ current = C23 (correct)`);
    } else {
      console.log(`  ⚠️  current = ${currentVersion} (attendu: C23)`);
    }

    if (standardVersion === 'C23') {
      console.log(`  ✅ standard = C23 (correct)`);
    } else {
      console.log(`  ⚠️  standard = ${standardVersion} (attendu: C23)`);
    }

    console.log('\n🎉 Correction terminée !');

  } finally {
    await app.close();
  }
}

fixCDuplicates().catch(error => {
  console.error('❌ Erreur lors de la correction:', error);
  process.exit(1);
});
