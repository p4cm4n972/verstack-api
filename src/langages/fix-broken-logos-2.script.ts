import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixBrokenLogos2() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES LOGOS CASSÉS (Batch 2)\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const logoFixes: Record<string, string> = {
      // DevOps tools
      'k6': 'https://avatars.githubusercontent.com/u/11428985?s=200&v=4',
      'Nomad': 'https://avatars.githubusercontent.com/u/6195651?s=200&v=4',
      'Snyk': 'https://avatars.githubusercontent.com/u/12959162?s=200&v=4',
      'Kustomize': 'https://avatars.githubusercontent.com/u/36015203?s=200&v=4',
      'Fluentd': 'https://avatars.githubusercontent.com/u/6691408?s=200&v=4',
      'Consul': 'https://avatars.githubusercontent.com/u/6195651?s=200&v=4',
      'Linkerd': 'https://avatars.githubusercontent.com/u/19630526?s=200&v=4',
      'Istio': 'https://avatars.githubusercontent.com/u/23534644?s=200&v=4',
      'Puppet': 'https://avatars.githubusercontent.com/u/38215?s=200&v=4',
      'Chef': 'https://avatars.githubusercontent.com/u/29740?s=200&v=4',
      'Podman': 'https://avatars.githubusercontent.com/u/49198571?s=200&v=4',
      'SonarQube': 'https://avatars.githubusercontent.com/u/455972?s=200&v=4',
      'Vault': 'https://avatars.githubusercontent.com/u/6195651?s=200&v=4',
      'Prometheus': 'https://avatars.githubusercontent.com/u/3380462?s=200&v=4',
      'PlatformIO': 'https://avatars.githubusercontent.com/u/9421573?s=200&v=4',

      // Data Science / IA tools
      'MLflow': 'https://avatars.githubusercontent.com/u/39938107?s=200&v=4',

      // Game tools
      'MonoGame': 'https://avatars.githubusercontent.com/u/1390200?s=200&v=4',
      'Cocos2d-x': 'https://avatars.githubusercontent.com/u/4990306?s=200&v=4',
      'Unity': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unity/unity-original.svg',
    };

    let fixedCount = 0;

    for (const [name, newLogoUrl] of Object.entries(logoFixes)) {
      const item = await langageModel.findOne({ name });
      if (item) {
        const oldLogo = item.logoUrl;
        item.logoUrl = newLogoUrl;
        await item.save();
        console.log(`✅ ${name}: ${oldLogo} → ${newLogoUrl}`);
        fixedCount++;
      } else {
        console.log(`❌ ${name} non trouvé`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n✅ ${fixedCount} logos corrigés avec des URLs CDN fiables`);

  } finally {
    await app.close();
  }
}

fixBrokenLogos2().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
