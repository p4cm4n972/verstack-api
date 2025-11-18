import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function testDelphiFix() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 Test de la correction Delphi\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { SYNC_LANGAGES } = await import('./langage-sync.config');
    const delphiConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'Delphi');

    if (!delphiConfig) {
      console.log('❌ Configuration Delphi introuvable');
      return;
    }

    // Afficher l'état avant
    const delphiBefore = await langageModel.findOne({ name: 'Delphi' }).exec();
    console.log('📋 AVANT re-synchronisation:');
    if (delphiBefore?.versions) {
      delphiBefore.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    }

    // Re-synchroniser
    console.log('\n🔄 Re-synchronisation avec filtre < 100...\n');
    await service.updateCustom(delphiConfig);

    // Afficher l'état après
    const delphiAfter = await langageModel.findOne({ name: 'Delphi' }).exec();
    console.log('📊 APRÈS re-synchronisation:');
    if (delphiAfter?.versions) {
      delphiAfter.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    }

    // Validation
    const currentVersion = delphiAfter?.versions?.find((v: any) => v.type === 'current')?.label;
    const majorVersion = parseInt(currentVersion?.split('.')[0] || '0');

    console.log('\n✅ VALIDATION:');
    console.log('─────────────────────────────────────────────────────────');
    if (majorVersion >= 10 && majorVersion < 100) {
      console.log(`  ✅ Version correcte détectée: ${currentVersion}`);
      console.log(`  ✅ Numéro majeur (${majorVersion}) dans la plage attendue (10-99)`);
    } else if (majorVersion >= 100) {
      console.log(`  ❌ Version aberrante: ${currentVersion}`);
      console.log(`  ❌ Numéro majeur (${majorVersion}) trop élevé (année détectée)`);
    } else {
      console.log(`  ⚠️  Version: ${currentVersion} (vérifier manuellement)`);
    }

  } finally {
    await app.close();
  }
}

testDelphiFix().catch(error => {
  console.error('❌ Erreur lors du test:', error);
  process.exit(1);
});
