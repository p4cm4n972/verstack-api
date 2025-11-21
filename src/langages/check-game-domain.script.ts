import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkGameDomain() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🎮 LANGAGES ET TOOLS DU DOMAINE "GAME"\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const gameItems = await langageModel
      .find({ domain: 'game' })
      .sort({ name: 1 })
      .exec();

    // Catégoriser
    const languages: any[] = [];
    const frameworks: any[] = [];
    const tools: any[] = [];
    const others: any[] = [];

    gameItems.forEach((item: any) => {
      const domains = item.domain || [];
      if (domains.includes('language')) {
        languages.push(item);
      } else if (domains.includes('framework')) {
        frameworks.push(item);
      } else if (domains.includes('tools')) {
        tools.push(item);
      } else {
        others.push(item);
      }
    });

    console.log(`🎮 Total: ${gameItems.length} éléments\n`);

    console.log('🔤 LANGAGES:');
    if (languages.length > 0) {
      languages.forEach((l: any) => {
        const version = l.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${l.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n🏗️ FRAMEWORKS:');
    if (frameworks.length > 0) {
      frameworks.forEach((f: any) => {
        const version = f.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${f.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n🔧 TOOLS:');
    if (tools.length > 0) {
      tools.forEach((t: any) => {
        const version = t.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${t.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n📦 AUTRES:');
    if (others.length > 0) {
      others.forEach((o: any) => {
        const version = o.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${o.name} (${version}) - domains: ${o.domain.join(', ')}`);
      });
    } else {
      console.log('  (aucun)');
    }

    // Suggestions
    console.log('\n\n💡 TECHNOLOGIES GAME DEV POPULAIRES À VÉRIFIER:');
    console.log('═══════════════════════════════════════════════════════════\n');

    const existingNames = gameItems.map((i: any) => i.name.toLowerCase());

    const suggestedGame = {
      'Langages': ['C++', 'C#', 'JavaScript', 'TypeScript', 'Python', 'Lua', 'GDScript'],
      'Game Engines 3D': ['Unity', 'Unreal Engine', 'Godot', 'CryEngine', 'O3DE', 'Bevy'],
      'Game Engines 2D': ['Godot', 'GameMaker', 'Construct', 'RPG Maker'],
      'Web Game Frameworks': ['Phaser', 'PixiJS', 'Three.js', 'Babylon.js', 'PlayCanvas'],
      'Cross-Platform Frameworks': ['libGDX', 'MonoGame', 'Cocos2d-x', 'Defold'],
      'Graphics APIs': ['OpenGL', 'Vulkan', 'DirectX', 'Metal', 'WebGL', 'WebGPU'],
      'Physics Engines': ['Box2D', 'Bullet Physics', 'PhysX', 'Havok', 'Jolt Physics'],
      'Audio Middleware': ['FMOD', 'Wwise', 'OpenAL'],
      'Networking': ['Photon', 'Mirror', 'Netcode for GameObjects', 'Colyseus'],
      'Scripting': ['Lua', 'Bolt', 'PlayMaker', 'Ink'],
      'Asset Tools': ['Blender', 'Spine', 'Tiled', 'Aseprite']
    };

    for (const [category, items] of Object.entries(suggestedGame)) {
      const missing = items.filter(item => !existingNames.includes(item.toLowerCase()));
      const present = items.filter(item => existingNames.includes(item.toLowerCase()));

      console.log(`${category}:`);
      if (present.length > 0) {
        console.log(`  ✅ Présents: ${present.join(', ')}`);
      }
      if (missing.length > 0) {
        console.log(`  ❌ Manquants: ${missing.join(', ')}`);
      }
      console.log('');
    }

  } finally {
    await app.close();
  }
}

checkGameDomain().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
