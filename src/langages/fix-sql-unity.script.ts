import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function fixSqlUnity() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 Correction de SQL et Unity\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // ====== SQL ======
    console.log('📋 SQL - État AVANT nettoyage:');
    console.log('─────────────────────────────────────────────────────────');
    const sqlBefore = await langageModel.findOne({ name: 'SQL' }).exec();
    if (sqlBefore?.versions) {
      sqlBefore.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    }

    // Nettoyer les duplicates SQL standards
    if (sqlBefore?.versions) {
      const standardVersions = sqlBefore.versions.filter((v: any) => v.type === 'standard');
      if (standardVersions.length > 1) {
        console.log(`\n⚠️  ${standardVersions.length} versions "standard" détectées, nettoyage...`);

        // Garder toutes les versions qui ne sont PAS de type "standard"
        const nonStandardVersions = sqlBefore.versions.filter((v: any) => v.type !== 'standard');

        await langageModel.updateOne(
          { name: 'SQL' },
          { $set: { versions: nonStandardVersions } }
        ).exec();

        console.log('✅ Duplicates "standard" supprimés');
      }
    }

    // Re-synchroniser SQL
    console.log('\n🔄 Re-synchronisation de SQL...');
    const { SYNC_LANGAGES } = await import('./langage-sync.config');
    const sqlConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'SQL');

    if (sqlConfig) {
      await service.updateCustom(sqlConfig);
    }

    console.log('\n📊 SQL - État APRÈS correction:');
    console.log('─────────────────────────────────────────────────────────');
    const sqlAfter = await langageModel.findOne({ name: 'SQL' }).exec();
    if (sqlAfter?.versions) {
      sqlAfter.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });

      const standardCount = sqlAfter.versions.filter((v: any) => v.type === 'standard').length;
      if (standardCount === 1) {
        console.log('\n✅ SQL: Une seule version "standard" (correct)');
      } else {
        console.log(`\n⚠️  SQL: ${standardCount} versions "standard" (problème persiste)`);
      }
    }

    // ====== Unity ======
    console.log('\n\n📋 Unity - État AVANT re-synchronisation:');
    console.log('─────────────────────────────────────────────────────────');
    const unityBefore = await langageModel.findOne({ name: 'Unity' }).exec();
    if (unityBefore?.versions && unityBefore.versions.length > 0) {
      unityBefore.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    } else {
      console.log('  ⚠️  Aucune version trouvée (besoin de re-sync)');
    }

    // Re-synchroniser Unity
    console.log('\n🔄 Re-synchronisation de Unity...');
    const unityConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'Unity');

    if (unityConfig) {
      await service.updateCustom(unityConfig);
    }

    console.log('\n📊 Unity - État APRÈS re-synchronisation:');
    console.log('─────────────────────────────────────────────────────────');
    const unityAfter = await langageModel.findOne({ name: 'Unity' }).exec();
    if (unityAfter?.versions && unityAfter.versions.length > 0) {
      unityAfter.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
      console.log('\n✅ Unity: Versions restaurées');
    } else {
      console.log('  ⚠️  Aucune version trouvée (échec de la synchronisation)');
    }

    console.log('\n\n💡 RÉSUMÉ');
    console.log('═══════════════════════════════════════════════════════════\n');

    const sqlFinal = await langageModel.findOne({ name: 'SQL' }).exec();
    const sqlStandardCount = sqlFinal?.versions?.filter((v: any) => v.type === 'standard').length || 0;
    const sqlCurrent = sqlFinal?.versions?.find((v: any) => v.type === 'current')?.label;

    const unityFinal = await langageModel.findOne({ name: 'Unity' }).exec();
    const unityCurrent = unityFinal?.versions?.find((v: any) => v.type === 'current')?.label;
    const unityLts = unityFinal?.versions?.find((v: any) => v.type === 'lts')?.label;

    console.log('SQL:');
    if (sqlStandardCount === 1 && sqlCurrent) {
      console.log(`  ✅ Standard unique: ${sqlCurrent}`);
    } else if (sqlStandardCount > 1) {
      console.log(`  ⚠️  ${sqlStandardCount} standards (duplicates non résolus)`);
    } else {
      console.log('  ⚠️  Pas de standard');
    }

    console.log('\nUnity:');
    if (unityCurrent) {
      console.log(`  ✅ current: ${unityCurrent}`);
      if (unityLts) {
        console.log(`  ✅ lts: ${unityLts}`);
      }
    } else {
      console.log('  ❌ Pas de version (échec)');
    }

  } finally {
    await app.close();
  }
}

fixSqlUnity().catch(error => {
  console.error('❌ Erreur lors de la correction:', error);
  process.exit(1);
});
