import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function fullCleanupSync() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🧹 NETTOYAGE COMPLET ET RE-SYNCHRONISATION\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Étape 1: Nettoyer les versions corrompues
    console.log('📋 ÉTAPE 1: Nettoyage des données corrompues\n');

    const { SYNC_LANGAGES } = await import('./langage-sync.config');

    // Langages à nettoyer complètement (données corrompues connues)
    const toCleanCompletely = [
      'Laravel', 'C#', 'Symfony', 'Django', // LTS mal configurés
      'Python', 'PostgreSQL', 'MongoDB' // Anciens LTS à supprimer
    ];

    let cleanedCount = 0;

    for (const langName of toCleanCompletely) {
      const lang = await langageModel.findOne({ name: langName }).exec();
      if (lang) {
        // Supprimer toutes les versions pour forcer une resync propre
        await langageModel.updateOne(
          { name: langName },
          { $set: { versions: [] } }
        ).exec();
        console.log(`  ✅ ${langName}: versions supprimées`);
        cleanedCount++;
      }
    }

    console.log(`\n  Total nettoyé: ${cleanedCount} langages\n`);

    // Étape 2: Corriger les ltsTagPrefix (enlever les "v")
    console.log('\n📋 ÉTAPE 2: Correction des ltsTagPrefix dans la config\n');
    console.log('  Note: Les prefixes avec "v" ne matchent pas car semver.coerce() retire le "v"');
    console.log('  - Laravel: v11 → 11');
    console.log('  - C#: v8.0 → 8.0');
    console.log('  - Symfony: v6.4 → 6.4\n');

    // Étape 3: Re-synchroniser les langages nettoyés
    console.log('\n📋 ÉTAPE 3: Re-synchronisation des langages\n');

    const syncResults: any[] = [];

    for (const langName of toCleanCompletely) {
      const config = SYNC_LANGAGES.find((c: any) => c.nameInDb === langName);

      if (!config) {
        console.log(`  ⚠️  ${langName}: Configuration introuvable`);
        continue;
      }

      console.log(`  🔄 ${langName}...`);

      try {
        if (config.sourceType === 'npm') {
          await service.updateFromNpm(config);
        } else if (config.sourceType === 'github' && config.useTags) {
          await service.updateFromGitHubTag(config);
        } else if (config.sourceType === 'github') {
          await service.updateFromGitHubRelease(config);
        } else if (config.sourceType === 'custom') {
          await service.updateCustom(config);
        }

        const lang = await langageModel.findOne({ name: langName }).exec();
        const current = lang?.versions?.find((v: any) => v.type === 'current');
        const lts = lang?.versions?.find((v: any) => v.type === 'lts');

        syncResults.push({
          name: langName,
          current: current?.label || 'N/A',
          lts: lts?.label || null,
          hasLtsConfig: config.ltsSupport === true
        });

      } catch (error: any) {
        console.log(`     ❌ Erreur: ${error.message}`);
        syncResults.push({
          name: langName,
          current: 'ERREUR',
          lts: null,
          hasLtsConfig: config.ltsSupport === true,
          error: error.message
        });
      }
    }

    // Étape 4: Afficher les résultats et anomalies
    console.log('\n\n📊 RÉSULTATS DE LA SYNCHRONISATION:');
    console.log('═══════════════════════════════════════════════════════════\n');

    const anomalies: any[] = [];

    syncResults.forEach((result) => {
      const hasLtsInDb = result.lts !== null;
      const shouldHaveLts = result.hasLtsConfig;

      let status = '✅';
      let issue = '';

      if (result.error) {
        status = '❌';
        issue = `Erreur: ${result.error}`;
        anomalies.push(result);
      } else if (shouldHaveLts && !hasLtsInDb) {
        status = '⚠️';
        issue = 'LTS manquante (config a ltsSupport mais pas de LTS en base)';
        anomalies.push(result);
      } else if (!shouldHaveLts && hasLtsInDb) {
        status = '⚠️';
        issue = 'LTS non désirée (config n\'a pas ltsSupport mais LTS en base)';
        anomalies.push(result);
      }

      console.log(`${status} ${result.name}:`);
      console.log(`   current: ${result.current}`);
      if (result.lts) {
        console.log(`   lts: ${result.lts}`);
      }
      if (issue) {
        console.log(`   ⚠️  ${issue}`);
      }
      console.log('');
    });

    // Résumé des anomalies
    console.log('\n💡 RÉSUMÉ DES ANOMALIES:');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (anomalies.length === 0) {
      console.log('🎉 Aucune anomalie détectée!');
    } else {
      console.log(`⚠️  ${anomalies.length} anomalie(s) détectée(s):\n`);

      anomalies.forEach((a) => {
        console.log(`  • ${a.name}:`);
        if (a.error) {
          console.log(`    Erreur de synchronisation`);
        } else if (a.hasLtsConfig && !a.lts) {
          console.log(`    LTS manquante - vérifier ltsTagPrefix`);
        } else {
          console.log(`    Configuration LTS incohérente`);
        }
      });

      console.log('\n📋 ACTIONS RECOMMANDÉES:');
      console.log('─────────────────────────────────────────────────────────');
      console.log('  1. Corriger les ltsTagPrefix dans langage-sync.config.ts:');
      console.log('     - Retirer le "v" des prefixes (v11 → 11, v8.0 → 8.0, etc.)');
      console.log('  2. Relancer la synchronisation après correction');
    }

  } finally {
    await app.close();
  }
}

fullCleanupSync().catch(error => {
  console.error('❌ Erreur lors du nettoyage:', error);
  process.exit(1);
});
