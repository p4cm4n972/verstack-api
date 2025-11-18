import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function testRustEdition() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🦀 Test de la synchronisation Rust avec édition\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Récupérer la config Rust
    const { SYNC_LANGAGES } = await import('./langage-sync.config');
    const rustConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'Rust');

    if (!rustConfig) {
      console.log('❌ Configuration Rust introuvable');
      return;
    }

    console.log('📋 Configuration Rust:');
    console.log(`  sourceType: ${rustConfig.sourceType}`);
    console.log(`  sourceUrl: ${rustConfig.sourceUrl}`);
    console.log(`  edition: ${rustConfig.edition || 'N/A'}`);
    console.log('');

    // Synchroniser Rust
    console.log('🔄 Synchronisation en cours...\n');
    await service.updateFromGitHubRelease(rustConfig);

    // Vérifier le résultat
    console.log('\n📊 Vérification des versions en base de données:\n');
    const rust = await langageModel.findOne({ name: 'Rust' }).exec();

    if (!rust) {
      console.log('❌ Rust introuvable en base');
      return;
    }

    (rust.versions || []).forEach((v: any) => {
      console.log(`  ${v.type}: ${v.label}`);
    });

    // Vérification
    const hasEdition = rust.versions?.some((v: any) => v.type === 'edition');
    const editionValue = rust.versions?.find((v: any) => v.type === 'edition')?.label;

    console.log('\n📋 Validation:');
    console.log('─────────────────────────────────────────────────────────');
    if (hasEdition && editionValue === '2024') {
      console.log('✅ Édition Rust configurée et synchronisée correctement !');
    } else if (hasEdition) {
      console.log(`⚠️  Édition présente mais valeur inattendue: ${editionValue}`);
    } else {
      console.log('❌ Édition non synchronisée');
    }

  } finally {
    await app.close();
  }
}

testRustEdition().catch(error => {
  console.error('❌ Erreur lors du test:', error);
  process.exit(1);
});
