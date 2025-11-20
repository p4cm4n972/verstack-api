import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixEmbeddedSupportDuration() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 AJOUT DES SUPPORT DURATION POUR LES OUTILS EMBEDDED\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Valeurs à appliquer (en mois)
    const supportDurations: Record<string, Record<string, number>> = {
      // RTOS - support long terme
      'FreeRTOS': { 'current': 24 },
      'Zephyr': { 'current': 18 },
      'RT-Thread': { 'current': 12 },
      'RIOT OS': { 'current': 12 },

      // Frameworks/HAL
      'Arduino': { 'current': 24 },
      'ESP-IDF': { 'current': 18 },
      'Mbed OS': { 'current': 18 },
      'STM32Cube': { 'current': 24 },
      'Nordic SDK': { 'current': 18 },

      // Build & Tools
      'PlatformIO': { 'current': 12 },
      'OpenOCD': { 'current': 12 },

      // Protocols - spec-based, no real support duration
      'MQTT': { 'current': 999 },  // Spec stable
      'CoAP': { 'current': 999 },  // RFC stable
      'Modbus': { 'current': 999 },  // Spec stable

      // Testing
      'Unity': { 'current': 12 },
      'CppUTest': { 'current': 12 }
    };

    let updated = 0;
    let created = 0;

    for (const [toolName, versionDurations] of Object.entries(supportDurations)) {
      const tool = await langageModel.findOne({ name: toolName }).exec();

      if (!tool) {
        console.log(`❌ ${toolName}: Non trouvé`);
        continue;
      }

      let modified = false;

      // Si pas de versions, créer la version current
      if (!tool.versions || tool.versions.length === 0) {
        tool.versions = [];
        for (const [type, duration] of Object.entries(versionDurations)) {
          tool.versions.push({
            type,
            label: 'N/A',
            supportDuration: duration,
            releaseDate: new Date().toISOString()
          });
          console.log(`  ✅ ${toolName} - ${type}: ${duration} mois (créé)`);
          created++;
        }
        modified = true;
      } else {
        // Mettre à jour les versions existantes
        for (const version of tool.versions) {
          const duration = versionDurations[version.type];
          if (duration !== undefined) {
            version.supportDuration = duration;
            console.log(`  ✅ ${toolName} - ${version.type}: ${duration} mois`);
            modified = true;
            updated++;
          }
        }

        // Créer les versions manquantes
        for (const [type, duration] of Object.entries(versionDurations)) {
          if (!tool.versions.find((v: any) => v.type === type)) {
            tool.versions.push({
              type,
              label: 'N/A',
              supportDuration: duration,
              releaseDate: new Date().toISOString()
            });
            console.log(`  ✅ ${toolName} - ${type}: ${duration} mois (créé)`);
            created++;
            modified = true;
          }
        }
      }

      if (modified) {
        await tool.save();
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Versions mises à jour: ${updated}`);
    console.log(`  • Versions créées: ${created}`);

  } finally {
    await app.close();
  }
}

fixEmbeddedSupportDuration().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
