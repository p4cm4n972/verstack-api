import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixGameDevopsAnomalies() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES ANOMALIES GAME/DEVOPS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Cocos2d-x - définir une version réelle
    console.log('📦 Cocos2d-x:');
    const cocos2dx = await langageModel.findOne({ name: 'Cocos2d-x' }).exec();
    if (cocos2dx) {
      const currentVersion = cocos2dx.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === 'N/A') {
        currentVersion.label = '4.0';
        currentVersion.releaseDate = new Date('2020-11-01').toISOString();
        await cocos2dx.save();
        console.log('  ✅ Version current définie: 4.0\n');
      } else {
        console.log('  ℹ️  Version déjà définie\n');
      }
    } else {
      console.log('  ❌ Cocos2d-x non trouvé\n');
    }

    // Unreal Engine - définir une version réelle
    console.log('📦 Unreal Engine:');
    const unreal = await langageModel.findOne({ name: 'Unreal Engine' }).exec();
    if (unreal) {
      const currentVersion = unreal.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === 'N/A') {
        currentVersion.label = '5.5.0';
        currentVersion.releaseDate = new Date('2024-11-12').toISOString();
        await unreal.save();
        console.log('  ✅ Version current définie: 5.5.0\n');
      } else {
        console.log('  ℹ️  Version déjà définie\n');
      }
    } else {
      console.log('  ❌ Unreal Engine non trouvé\n');
    }

    // GameMaker - définir une version réelle
    console.log('📦 GameMaker:');
    const gamemaker = await langageModel.findOne({ name: 'GameMaker' }).exec();
    if (gamemaker) {
      const currentVersion = gamemaker.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === 'N/A') {
        currentVersion.label = '2024.11.0.171';
        currentVersion.releaseDate = new Date('2024-11-14').toISOString();
        await gamemaker.save();
        console.log('  ✅ Version current définie: 2024.11.0.171\n');
      } else {
        console.log('  ℹ️  Version déjà définie\n');
      }
    } else {
      console.log('  ❌ GameMaker non trouvé\n');
    }

    // Godot - normaliser 4.5.1-stable → 4.5.1
    console.log('📦 Godot:');
    const godot = await langageModel.findOne({ name: 'Godot' }).exec();
    if (godot) {
      let modified = false;
      godot.versions.forEach((v: any) => {
        if (v.label && v.label.endsWith('-stable')) {
          const oldLabel = v.label;
          v.label = v.label.replace(/-stable$/, '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });
      if (modified) {
        await godot.save();
        console.log('  ✅ Godot mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ Godot non trouvé\n');
    }

    // Blender - définir une version réelle
    console.log('📦 Blender:');
    const blender = await langageModel.findOne({ name: 'Blender' }).exec();
    if (blender) {
      const currentVersion = blender.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === 'N/A') {
        currentVersion.label = '4.3.0';
        currentVersion.releaseDate = new Date('2024-10-08').toISOString();
        await blender.save();
        console.log('  ✅ Version current définie: 4.3.0\n');
      } else {
        console.log('  ℹ️  Version déjà définie\n');
      }
    } else {
      console.log('  ❌ Blender non trouvé\n');
    }

    // Jenkins - normaliser jenkins-2.538 → 2.538
    console.log('📦 Jenkins:');
    const jenkins = await langageModel.findOne({ name: 'Jenkins' }).exec();
    if (jenkins) {
      let modified = false;
      jenkins.versions.forEach((v: any) => {
        if (v.label && v.label.startsWith('jenkins-')) {
          const oldLabel = v.label;
          v.label = v.label.replace(/^jenkins-/, '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });
      if (modified) {
        await jenkins.save();
        console.log('  ✅ Jenkins mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ Jenkins non trouvé\n');
    }

    // GitLab CI - définir une version réelle
    console.log('📦 GitLab CI:');
    const gitlab = await langageModel.findOne({ name: 'GitLab CI' }).exec();
    if (gitlab) {
      const currentVersion = gitlab.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === 'N/A') {
        currentVersion.label = '17.6.0';
        currentVersion.releaseDate = new Date('2024-11-21').toISOString();
        await gitlab.save();
        console.log('  ✅ Version current définie: 17.6.0\n');
      } else {
        console.log('  ℹ️  Version déjà définie\n');
      }
    } else {
      console.log('  ❌ GitLab CI non trouvé\n');
    }

    // CircleCI - définir une version réelle
    console.log('📦 CircleCI:');
    const circleci = await langageModel.findOne({ name: 'CircleCI' }).exec();
    if (circleci) {
      const currentVersion = circleci.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === 'N/A') {
        currentVersion.label = '2024.11';
        currentVersion.releaseDate = new Date('2024-11-01').toISOString();
        await circleci.save();
        console.log('  ✅ Version current définie: 2024.11 (date-based)\n');
      } else {
        console.log('  ℹ️  Version déjà définie\n');
      }
    } else {
      console.log('  ❌ CircleCI non trouvé\n');
    }

    // Linkerd - normaliser edge-25.11.2 → 25.11.2
    console.log('📦 Linkerd:');
    const linkerd = await langageModel.findOne({ name: 'Linkerd' }).exec();
    if (linkerd) {
      let modified = false;
      linkerd.versions.forEach((v: any) => {
        if (v.label && v.label.startsWith('edge-')) {
          const oldLabel = v.label;
          v.label = v.label.replace(/^edge-/, '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });
      if (modified) {
        await linkerd.save();
        console.log('  ✅ Linkerd mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ Linkerd non trouvé\n');
    }

    // Kustomize - normaliser kustomize/v5.8.0 → 5.8.0
    console.log('📦 Kustomize:');
    const kustomize = await langageModel.findOne({ name: 'Kustomize' }).exec();
    if (kustomize) {
      let modified = false;
      kustomize.versions.forEach((v: any) => {
        if (v.label && v.label.startsWith('kustomize/v')) {
          const oldLabel = v.label;
          v.label = v.label.replace(/^kustomize\/v/, '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });
      if (modified) {
        await kustomize.save();
        console.log('  ✅ Kustomize mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ Kustomize non trouvé\n');
    }

    // Selenium - normaliser selenium-4.38.0 → 4.38.0
    console.log('📦 Selenium:');
    const selenium = await langageModel.findOne({ name: 'Selenium' }).exec();
    if (selenium) {
      let modified = false;
      selenium.versions.forEach((v: any) => {
        if (v.label && v.label.startsWith('selenium-')) {
          const oldLabel = v.label;
          v.label = v.label.replace(/^selenium-/, '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });
      if (modified) {
        await selenium.save();
        console.log('  ✅ Selenium mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ Selenium non trouvé\n');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n✅ Corrections appliquées');
    console.log('\n💡 Note: Les normalizeLabel géreront automatiquement les futures versions.');

  } finally {
    await app.close();
  }
}

fixGameDevopsAnomalies().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
