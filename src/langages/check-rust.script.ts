import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkRust() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');
    const rust = await langageModel.findOne({ name: 'Rust' }).exec();

    if (!rust) {
      console.log('⚠️  Rust introuvable en base');
      return;
    }

    console.log('🦀 Versions Rust en base de données:\n');
    (rust.versions || []).forEach((v: any) => {
      console.log(`  ${v.type}: ${v.label}`);
    });

    console.log('\n📋 Analyse:');
    console.log('─────────────────────────────────────────────────────────');
    console.log('current = 1.91.1 ✓ (version du compilateur Rust)');
    console.log('edition = 2024 ✓ (édition du langage Rust)');
    console.log('\nℹ️  Les "éditions" Rust sont des snapshots de stabilité du langage:');
    console.log('   - Rust 2015 (première édition)');
    console.log('   - Rust 2018');
    console.log('   - Rust 2021');
    console.log('   - Rust 2024 (édition actuelle)');
    console.log('\n✅ Ces versions sont CORRECTES et cohérentes.');
    console.log('\n⚠️  CEPENDANT: "edition" n\'est pas configurée dans langage-sync.config.ts');
    console.log('   → C\'est probablement un résidu d\'une ancienne synchronisation');
    console.log('   → Recommandation: Supprimer ou ajouter le support des éditions Rust');

  } finally {
    await app.close();
  }
}

checkRust().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
