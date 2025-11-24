import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixEmbeddedAnomalies() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES ANOMALIES EMBEDDED\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // V (Vlang) - normaliser weekly.2025.47 → 2025.47
    console.log('📦 V (Vlang):');
    const vlang = await langageModel.findOne({ name: 'V' }).exec();
    if (vlang) {
      let modified = false;
      vlang.versions.forEach((v: any) => {
        if (v.label && v.label.startsWith('weekly.')) {
          const oldLabel = v.label;
          v.label = v.label.replace(/^weekly\./, '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });
      if (modified) {
        await vlang.save();
        console.log('  ✅ V mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ V non trouvé\n');
    }

    // STM32Cube - définir une version manuelle
    console.log('📦 STM32Cube:');
    const stm32 = await langageModel.findOne({ name: 'STM32Cube' }).exec();
    if (stm32) {
      const currentVersion = stm32.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === 'N/A') {
        currentVersion.label = '1.16.0';
        currentVersion.releaseDate = new Date('2024-09-01').toISOString();
        await stm32.save();
        console.log('  ✅ Version current définie: 1.16.0\n');
      } else {
        console.log('  ℹ️  Version déjà définie\n');
      }
    } else {
      console.log('  ❌ STM32Cube non trouvé\n');
    }

    // Mbed OS - normaliser mbed-os-6.17.0 → 6.17.0
    console.log('📦 Mbed OS:');
    const mbed = await langageModel.findOne({ name: 'Mbed OS' }).exec();
    if (mbed) {
      let modified = false;
      mbed.versions.forEach((v: any) => {
        if (v.label && v.label.startsWith('mbed-os-')) {
          const oldLabel = v.label;
          v.label = v.label.replace(/^mbed-os-/, '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });
      if (modified) {
        await mbed.save();
        console.log('  ✅ Mbed OS mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ Mbed OS non trouvé\n');
    }

    // PlatformIO - corriger la version (0.0.1-security est un package malveillant)
    console.log('📦 PlatformIO:');
    const pio = await langageModel.findOne({ name: 'PlatformIO' }).exec();
    if (pio) {
      const currentVersion = pio.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === '0.0.1-security') {
        currentVersion.label = '6.1.16';
        currentVersion.releaseDate = new Date('2024-11-01').toISOString();
        await pio.save();
        console.log('  ✅ Version current corrigée: 6.1.16 (npm malveillant supprimé)\n');
      } else {
        console.log('  ℹ️  Version déjà correcte\n');
      }
    } else {
      console.log('  ❌ PlatformIO non trouvé\n');
    }

    // CppUTest - définir une version réelle
    console.log('📦 CppUTest:');
    const cpputest = await langageModel.findOne({ name: 'CppUTest' }).exec();
    if (cpputest) {
      const currentVersion = cpputest.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === 'latest-passing-build') {
        currentVersion.label = '4.0';
        currentVersion.releaseDate = new Date('2020-09-01').toISOString();
        await cpputest.save();
        console.log('  ✅ Version current définie: 4.0\n');
      } else {
        console.log('  ℹ️  Version déjà définie\n');
      }
    } else {
      console.log('  ❌ CppUTest non trouvé\n');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n✅ Corrections appliquées');
    console.log('\n💡 Note: Les normalizeLabel géreront automatiquement les futures versions.');

  } finally {
    await app.close();
  }
}

fixEmbeddedAnomalies().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
