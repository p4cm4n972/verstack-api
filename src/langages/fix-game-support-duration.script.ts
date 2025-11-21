import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixGameSupportDuration() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🎮 AJOUT DES SUPPORT DURATION POUR LES OUTILS GAME\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Valeurs à appliquer (en mois)
    const supportDurations: Record<string, Record<string, number>> = {
      // Game Engines 3D - cycles longs, outils professionnels
      'Unreal Engine': { 'current': 24 },
      'Godot': { 'current': 12 },

      // Game Engines 2D
      'GameMaker': { 'current': 18 },

      // Web Game Frameworks - écosystème web, évolution plus rapide
      'Phaser': { 'current': 12 },
      'Three.js': { 'current': 12 },
      'Babylon.js': { 'current': 12 },
      'PixiJS': { 'current': 12 },
      'PlayCanvas': { 'current': 12 },

      // Cross-Platform Frameworks
      'libGDX': { 'current': 18 },
      'MonoGame': { 'current': 18 },
      'Cocos2d-x': { 'current': 18 },
      'Defold': { 'current': 12 },

      // Graphics APIs - standards stables
      'OpenGL': { 'current': 60 },
      'Vulkan': { 'current': 24 },
      'DirectX': { 'current': 36 },
      'Metal': { 'current': 24 },

      // Physics Engines - outils matures
      'Box2D': { 'current': 24 },
      'Bullet Physics': { 'current': 24 },

      // Audio Middleware - cycles longs
      'FMOD': { 'current': 24 },
      'Wwise': { 'current': 24 },

      // Networking
      'Photon': { 'current': 18 },
      'Mirror': { 'current': 12 },

      // Asset Tools
      'Blender': { 'current': 18 },
      'Aseprite': { 'current': 12 }
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

fixGameSupportDuration().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
