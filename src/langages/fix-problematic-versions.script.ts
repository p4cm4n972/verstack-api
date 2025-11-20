import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';

async function fixProblematicVersions() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');
    const service = app.get(LangageUpdateOptimizedService);

    const toFix = [
      'Yarn', 'Nginx', 'Django', 'Perl', 'Haskell', 'V', 'Maestro', 'SQLite'
    ];

    console.log('🔧 CORRECTION DES VERSIONS PROBLÉMATIQUES\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Step 1: Clean corrupted versions
    for (const name of toFix) {
      const tool = await langageModel.findOne({ name }).exec();
      if (tool && tool.versions) {
        const before = tool.versions.map((v: any) => `${v.type}:${v.label}`).join(', ');

        // Remove versions with corrupted data
        tool.versions = tool.versions.filter((v: any) => {
          const label = v.label || '';
          // Keep versions that look valid or are N/A (will be synced)
          if (label === 'N/A') return true;
          // Remove obviously corrupted versions
          if (label.includes('2009.0.0') || label.includes('2010.0.0') || label.includes('11550.0.0')) {
            return false;
          }
          return true;
        });

        await tool.save();
        const after = tool.versions.map((v: any) => `${v.type}:${v.label}`).join(', ');
        console.log(`🧹 ${name}:`);
        console.log(`   Avant: ${before}`);
        console.log(`   Après: ${after}\n`);
      }
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n🔄 RE-SYNCHRONISATION...\n');

    // Step 2: Re-sync
    const result = await service.syncAll({ concurrency: 3 });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé: ${result.success.length} succès, ${result.failed.length} échecs`);

    if (result.failed.length > 0) {
      console.log('\nÉchecs:');
      result.failed.forEach(f => console.log(`  ❌ ${f.name}: ${f.error}`));
    }

  } finally {
    await app.close();
  }
}

fixProblematicVersions().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
