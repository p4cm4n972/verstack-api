import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixSpecificBrokenLogos() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES LOGOS CASSÉS SPÉCIFIQUES\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Map des logos à corriger avec des URLs CDN fiables
    const logoFixes: Record<string, string> = {
      'Rust': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg',
      'Deno': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/denojs/denojs-original.svg',
      'Three.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg',
      'Babylon.js': 'https://avatars.githubusercontent.com/u/8985764?s=200&v=4',
      'PixiJS': 'https://avatars.githubusercontent.com/u/9423041?s=200&v=4',
      'PlayCanvas': 'https://avatars.githubusercontent.com/u/1765439?s=200&v=4',
      'Redis': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
      'Delphi': 'https://styles.redditmedia.com/t5_2qh3a/styles/communityIcon_ujsqgqku9f471.png',
      'NativeScript': 'https://avatars.githubusercontent.com/u/7392261?s=200&v=4',
      'Capacitor': 'https://avatars.githubusercontent.com/u/32975825?s=200&v=4',
      'Expo': 'https://avatars.githubusercontent.com/u/12504344?s=200&v=4',
      'Fastlane': 'https://avatars.githubusercontent.com/u/11098337?s=200&v=4',
      'Bloc': 'https://avatars.githubusercontent.com/u/32199657?s=200&v=4',
      'GetX': 'https://raw.githubusercontent.com/jonataslaw/getx/master/.github/logo.png',
      'Detox': 'https://avatars.githubusercontent.com/u/32538052?s=200&v=4',
      'Maestro': 'https://avatars.githubusercontent.com/u/104432165?s=200&v=4',
      'Realm': 'https://avatars.githubusercontent.com/u/4571654?s=200&v=4'
    };

    let updated = 0;
    let failed = 0;

    for (const [name, newLogoUrl] of Object.entries(logoFixes)) {
      try {
        const result = await langageModel.updateOne(
          { name },
          { $set: { logoUrl: newLogoUrl } }
        ).exec();

        if (result.matchedCount > 0) {
          console.log(`  ✅ ${name}: logo corrigé`);
          console.log(`     ${newLogoUrl}`);
          updated++;
        } else {
          console.log(`  ⚠️  ${name}: non trouvé en base`);
          failed++;
        }
      } catch (error) {
        console.log(`  ❌ ${name}: erreur lors de la mise à jour`);
        console.error(error);
        failed++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Logos corrigés: ${updated}`);
    console.log(`  • Non trouvés/Échecs: ${failed}`);
    console.log(`\n💡 Les logos utilisent maintenant des URLs CDN fiables (devicons, GitHub avatars)`);

  } finally {
    await app.close();
  }
}

fixSpecificBrokenLogos().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
