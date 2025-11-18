import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function fixDelphiAndV() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 Correction de Delphi et V\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { SYNC_LANGAGES } = await import('./langage-sync.config');

    // ===== DELPHI =====
    console.log('🔹 DELPHI');
    console.log('─────────────────────────────────────────────────────────\n');

    const delphiConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'Delphi');

    if (delphiConfig) {
      console.log('🔄 Re-synchronisation de Delphi...\n');

      try {
        await service.updateCustom(delphiConfig);

        const delphi = await langageModel.findOne({ name: 'Delphi' }).exec();
        console.log('\n📊 Résultat:');
        if (delphi?.versions && delphi.versions.length > 0) {
          delphi.versions.forEach((v: any) => {
            console.log(`  ${v.type}: ${v.label}`);
          });
          console.log('  ✅ Delphi re-synchronisé avec succès');
        } else {
          console.log('  ⚠️  Aucune version récupérée (vérifier le custom updater)');
        }
      } catch (error: any) {
        console.log(`  ❌ Erreur: ${error.message}`);
      }
    }

    // ===== V (Vlang) =====
    console.log('\n\n🔹 V (Vlang)');
    console.log('─────────────────────────────────────────────────────────\n');

    const vBefore = await langageModel.findOne({ name: 'V' }).exec();
    console.log('📋 AVANT normalisation:');
    if (vBefore?.versions) {
      vBefore.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    }

    const vConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'V');

    if (vConfig) {
      console.log('\n🔄 Re-synchronisation de V avec nouvelle normalisation...\n');

      try {
        await service.updateFromGitHubRelease(vConfig);

        const vAfter = await langageModel.findOne({ name: 'V' }).exec();
        console.log('📊 APRÈS normalisation:');
        if (vAfter?.versions) {
          vAfter.versions.forEach((v: any) => {
            console.log(`  ${v.type}: ${v.label}`);
          });

          const currentLabel = vAfter.versions.find((v: any) => v.type === 'current')?.label;
          if (currentLabel && !/^weekly\./.test(currentLabel)) {
            console.log('  ✅ Format normalisé avec succès (préfixe "weekly." retiré)');
          } else if (currentLabel && /^weekly\./.test(currentLabel)) {
            console.log('  ⚠️  Format non normalisé (préfixe "weekly." encore présent)');
          }
        }
      } catch (error: any) {
        console.log(`  ❌ Erreur: ${error.message}`);
      }
    }

    console.log('\n\n✅ Corrections terminées !');

  } finally {
    await app.close();
  }
}

fixDelphiAndV().catch(error => {
  console.error('❌ Erreur lors des corrections:', error);
  process.exit(1);
});
