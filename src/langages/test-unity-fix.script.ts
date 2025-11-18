import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function testUnityFix() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 Test de la correction Unity\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { SYNC_LANGAGES } = await import('./langage-sync.config');
    const unityConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'Unity');

    if (!unityConfig) {
      console.log('❌ Configuration Unity introuvable');
      return;
    }

    // Afficher l'état avant
    const unityBefore = await langageModel.findOne({ name: 'Unity' }).exec();
    console.log('📋 AVANT re-synchronisation:');
    if (unityBefore?.versions && unityBefore.versions.length > 0) {
      unityBefore.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    } else {
      console.log('  ⚠️  Aucune version');
    }

    // Re-synchroniser
    console.log('\n🔄 Re-synchronisation avec tri correct...\n');
    await service.updateCustom(unityConfig);

    // Afficher l'état après
    const unityAfter = await langageModel.findOne({ name: 'Unity' }).exec();
    console.log('\n📊 APRÈS re-synchronisation:');
    if (unityAfter?.versions) {
      unityAfter.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    }

    // Validation
    const currentVersion = unityAfter?.versions?.find((v: any) => v.type === 'current')?.label;
    const ltsVersion = unityAfter?.versions?.find((v: any) => v.type === 'lts')?.label;

    console.log('\n✅ VALIDATION:');
    console.log('─────────────────────────────────────────────────────────');

    if (currentVersion?.startsWith('6000')) {
      console.log(`  ✅ Version current correcte: ${currentVersion} (Unity 6)`);
    } else if (currentVersion?.startsWith('2023') || currentVersion?.startsWith('2024')) {
      console.log(`  ✅ Version current récente: ${currentVersion}`);
    } else {
      console.log(`  ⚠️  Version current: ${currentVersion} (attendue: 6000.x.xfx ou 2023+)`);
    }

    if (ltsVersion?.startsWith('2021.3')) {
      console.log(`  ✅ Version LTS correcte: ${ltsVersion} (Unity 2021 LTS)`);
    } else if (ltsVersion) {
      console.log(`  ⚠️  Version LTS: ${ltsVersion} (attendue: 2021.3.x)`);
    } else {
      console.log(`  ⚠️  Pas de version LTS`);
    }

    console.log('\n📘 Note: Unity 6 utilise un nouveau schéma de version (6000.x.x)');

  } finally {
    await app.close();
  }
}

testUnityFix().catch(error => {
  console.error('❌ Erreur lors du test:', error);
  process.exit(1);
});
