import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function addGameEssentials() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🎮 AJOUT DES ESSENTIELS ET IMPORTANTS POUR LE DOMAINE GAME\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const gameItems = [
      // === ESSENTIELS ===
      // Game Engines 3D
      {
        name: 'Unreal Engine',
        domain: ['game', 'tools'],
        description: 'Moteur de jeu 3D professionnel développé par Epic Games',
        logoUrl: 'https://cdn2.unrealengine.com/ue-logo-stacked-unreal-engine-w-677x545-fac11de0943f.png',
        documentation: 'https://docs.unrealengine.com/',
        initialRelease: '1998',
        versions: []
      },
      {
        name: 'Godot',
        domain: ['game', 'tools'],
        description: 'Moteur de jeu 2D/3D open-source',
        logoUrl: 'https://godotengine.org/themes/godotengine/assets/og_image.png',
        documentation: 'https://docs.godotengine.org/',
        initialRelease: '2014',
        versions: []
      },
      // Game Engines 2D
      {
        name: 'GameMaker',
        domain: ['game', 'tools'],
        description: 'Moteur de jeu 2D avec langage GML',
        logoUrl: 'https://avatars.githubusercontent.com/u/5556149?s=200&v=4',
        documentation: 'https://manual.gamemaker.io/',
        initialRelease: '1999',
        versions: []
      },
      // Web Game Frameworks
      {
        name: 'Phaser',
        domain: ['game', 'web', 'framework'],
        description: 'Framework de jeu HTML5 2D',
        logoUrl: 'https://phaser.io/images/img.png',
        documentation: 'https://newdocs.phaser.io/',
        initialRelease: '2013',
        versions: []
      },
      {
        name: 'Three.js',
        domain: ['game', 'web', 'framework'],
        description: 'Bibliothèque JavaScript pour 3D avec WebGL',
        logoUrl: 'https://threejs.org/files/share.png',
        documentation: 'https://threejs.org/docs/',
        initialRelease: '2010',
        versions: []
      },
      {
        name: 'Babylon.js',
        domain: ['game', 'web', 'framework'],
        description: 'Moteur de jeu 3D web puissant',
        logoUrl: 'https://www.babylonjs.com/img/logo-babylonjs-social-twitter.png',
        documentation: 'https://doc.babylonjs.com/',
        initialRelease: '2013',
        versions: []
      },
      // Graphics APIs
      {
        name: 'OpenGL',
        domain: ['game', 'tools'],
        description: 'API graphique cross-platform',
        logoUrl: 'https://www.opengl.org/img/opengl_logo.png',
        documentation: 'https://www.opengl.org/documentation/',
        initialRelease: '1992',
        versions: []
      },
      {
        name: 'Vulkan',
        domain: ['game', 'tools'],
        description: 'API graphique moderne haute performance',
        logoUrl: 'https://www.vulkan.org/user/themes/vulkan/images/logo/vulkan-logo.svg',
        documentation: 'https://www.vulkan.org/learn',
        initialRelease: '2016',
        versions: []
      },
      {
        name: 'DirectX',
        domain: ['game', 'tools'],
        description: 'Collection d\'APIs multimédias de Microsoft',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/54/DirectX_logo.svg',
        documentation: 'https://docs.microsoft.com/en-us/windows/win32/directx',
        initialRelease: '1995',
        versions: []
      },
      // Asset Tools
      {
        name: 'Blender',
        domain: ['game', 'tools'],
        description: 'Suite de création 3D open-source',
        logoUrl: 'https://download.blender.org/branding/community/blender_community_badge_white.svg',
        documentation: 'https://docs.blender.org/',
        initialRelease: '1998',
        versions: []
      },

      // === IMPORTANTS ===
      // Web Game Frameworks
      {
        name: 'PixiJS',
        domain: ['game', 'web', 'framework'],
        description: 'Moteur de rendu 2D WebGL rapide',
        logoUrl: 'https://pixijs.com/assets/images/logo.svg',
        documentation: 'https://pixijs.com/guides',
        initialRelease: '2013',
        versions: []
      },
      {
        name: 'PlayCanvas',
        domain: ['game', 'web', 'tools'],
        description: 'Moteur de jeu WebGL open-source',
        logoUrl: 'https://playcanvas.com/static-assets/images/logo/playcanvas-logo-medium.png',
        documentation: 'https://developer.playcanvas.com/',
        initialRelease: '2011',
        versions: []
      },
      // Cross-Platform Frameworks
      {
        name: 'libGDX',
        domain: ['game', 'framework'],
        description: 'Framework de jeu Java cross-platform',
        logoUrl: 'https://libgdx.com/assets/images/logo.png',
        documentation: 'https://libgdx.com/wiki/',
        initialRelease: '2010',
        versions: []
      },
      {
        name: 'MonoGame',
        domain: ['game', 'framework'],
        description: 'Framework C# pour créer des jeux cross-platform',
        logoUrl: 'https://www.monogame.net/images/logo.svg',
        documentation: 'https://docs.monogame.net/',
        initialRelease: '2009',
        versions: []
      },
      {
        name: 'Cocos2d-x',
        domain: ['game', 'framework'],
        description: 'Framework de jeu C++ cross-platform',
        logoUrl: 'https://www.cocos.com/wp-content/uploads/2021/03/cocos-logo.png',
        documentation: 'https://docs.cocos.com/cocos2d-x/manual/',
        initialRelease: '2010',
        versions: []
      },
      {
        name: 'Defold',
        domain: ['game', 'tools'],
        description: 'Moteur de jeu 2D cross-platform',
        logoUrl: 'https://defold.com/images/logo/defold/logo-ver-classic-white-160.png',
        documentation: 'https://defold.com/learn/',
        initialRelease: '2016',
        versions: []
      },
      // Physics Engines
      {
        name: 'Box2D',
        domain: ['game', 'tools'],
        description: 'Moteur physique 2D open-source',
        logoUrl: 'https://box2d.org/images/logo.svg',
        documentation: 'https://box2d.org/documentation/',
        initialRelease: '2006',
        versions: []
      },
      {
        name: 'Bullet Physics',
        domain: ['game', 'tools'],
        description: 'Moteur physique 3D temps réel',
        logoUrl: 'https://pybullet.org/wordpress/wp-content/uploads/2016/02/bullet_logo.png',
        documentation: 'https://github.com/bulletphysics/bullet3/blob/master/docs/BulletQuickstart.pdf',
        initialRelease: '2003',
        versions: []
      },
      // Audio Middleware
      {
        name: 'FMOD',
        domain: ['game', 'tools'],
        description: 'Système audio professionnel pour jeux',
        logoUrl: 'https://www.fmod.com/images/fmod-logo.svg',
        documentation: 'https://www.fmod.com/docs',
        initialRelease: '1998',
        versions: []
      },
      {
        name: 'Wwise',
        domain: ['game', 'tools'],
        description: 'Middleware audio interactif pour jeux',
        logoUrl: 'https://www.audiokinetic.com/wp-content/uploads/2022/03/Wwise_Logo.svg',
        documentation: 'https://www.audiokinetic.com/library/',
        initialRelease: '2006',
        versions: []
      },
      // Networking
      {
        name: 'Photon',
        domain: ['game', 'tools'],
        description: 'Solution de networking multiplayer',
        logoUrl: 'https://doc.photonengine.com/images/photon-logo-128.png',
        documentation: 'https://doc.photonengine.com/',
        initialRelease: '2010',
        versions: []
      },
      {
        name: 'Mirror',
        domain: ['game', 'tools'],
        description: 'Solution de networking pour Unity',
        logoUrl: 'https://mirror-networking.gitbook.io/~gitbook/image?url=https%3A%2F%2F3806744084-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-LqPcRsH2HxPH7VVoxfk%252Ficon%252FqR3DuPzC0Yx37CwBfHWs%252Fmirror-icon-light.png%3Falt%3Dmedia%26token%3D4dc12c24-0b6e-4a09-a4c3-6b1edb5c7a49&width=32&dpr=2&quality=100&sign=dcd5d6b4&sv=1',
        documentation: 'https://mirror-networking.gitbook.io/docs/',
        initialRelease: '2018',
        versions: []
      },
      // Graphics APIs
      {
        name: 'Metal',
        domain: ['game', 'tools'],
        description: 'API graphique d\'Apple pour iOS/macOS',
        logoUrl: 'https://developer.apple.com/metal/images/metal-hero-large_2x.png',
        documentation: 'https://developer.apple.com/metal/',
        initialRelease: '2014',
        versions: []
      },
      // Asset Tools
      {
        name: 'Aseprite',
        domain: ['game', 'tools'],
        description: 'Éditeur de sprites et animations pixel art',
        logoUrl: 'https://www.aseprite.org/assets/images/aseprite-logo.png',
        documentation: 'https://www.aseprite.org/docs/',
        initialRelease: '2001',
        versions: []
      },

      // Update existing to add game domain
      { name: 'JavaScript', addGameOnly: true },
      { name: 'TypeScript', addGameOnly: true },
      { name: 'Python', addGameOnly: true }
    ];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of gameItems) {
      const existing = await langageModel.findOne({ name: item.name }).exec();

      if (existing) {
        if (item.addGameOnly) {
          if (!existing.domain.includes('game')) {
            await langageModel.updateOne(
              { name: item.name },
              { $addToSet: { domain: 'game' } }
            ).exec();
            console.log(`  ✅ ${item.name}: domaine 'game' ajouté`);
            updated++;
          } else {
            console.log(`  ⏭️  ${item.name}: déjà dans le domaine game`);
            skipped++;
          }
        } else {
          const newDomains = [...new Set([...existing.domain, ...(item.domain || [])])];
          if (newDomains.length !== existing.domain.length) {
            await langageModel.updateOne(
              { name: item.name },
              { $set: { domain: newDomains } }
            ).exec();
            console.log(`  ✅ ${item.name}: domaines mis à jour`);
            updated++;
          } else {
            console.log(`  ⏭️  ${item.name}: existe déjà avec les bons domaines`);
            skipped++;
          }
        }
      } else {
        if (!item.addGameOnly) {
          const newItem = {
            name: item.name,
            domain: item.domain,
            description: item.description || '',
            logoUrl: item.logoUrl || '',
            documentation: item.documentation || '',
            initialRelease: item.initialRelease || '',
            versions: item.versions || [],
            recommendations: 0
          };

          await langageModel.create(newItem);
          console.log(`  ✅ ${item.name}: créé`);
          created++;
        } else {
          console.log(`  ⚠️  ${item.name}: n'existe pas en base`);
          skipped++;
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Créés: ${created}`);
    console.log(`  • Mis à jour: ${updated}`);
    console.log(`  • Ignorés: ${skipped}`);
    console.log(`  • Total traité: ${gameItems.length}`);

  } finally {
    await app.close();
  }
}

addGameEssentials().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
