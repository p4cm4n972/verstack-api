import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkBrokenLogos2() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 VÉRIFICATION DES LOGOS CASSÉS (Batch 2)\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const items = [
      'k6', 'Nomad', 'Snyk', 'Kustomize', 'Fluentd', 'Consul',
      'Linkerd', 'Istio', 'Puppet', 'Chef', 'Podman', 'SonarQube',
      'Vault', 'Prometheus', 'PlatformIO', 'MLflow', 'MonoGame',
      'Cocos2d-x', 'Unity'
    ];

    for (const itemName of items) {
      const item = await langageModel.findOne({ name: itemName }).exec();

      if (item) {
        console.log(`📦 ${item.name}:`);
        console.log(`  Logo: ${item.logoUrl}\n`);
      } else {
        console.log(`❌ ${itemName} non trouvé\n`);
      }
    }

    console.log('═══════════════════════════════════════════════════════════');

  } finally {
    await app.close();
  }
}

checkBrokenLogos2().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
