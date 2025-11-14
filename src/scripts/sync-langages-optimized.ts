import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from '../langages/langage-update-optimized.service';
import { ConfigValidator } from '../langages/config.validator';
import { SYNC_LANGAGES } from '../langages/langage-sync.config';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(LangageUpdateOptimizedService);

  console.log('🔍 Validation de la configuration...');

  // Validation de la configuration
  const validation = ConfigValidator.validateConfigs(SYNC_LANGAGES);
  const duplicates = ConfigValidator.getDuplicateNameInDb(SYNC_LANGAGES);
  const stats = ConfigValidator.getConfigStats(SYNC_LANGAGES);

  console.log('📊 Statistiques de configuration:', JSON.stringify(stats, null, 2));

  if (validation.invalid.length > 0) {
    console.error('❌ Configurations invalides détectées:');
    validation.invalid.forEach(({ config, errors }) => {
      console.error(`  - ${config.nameInDb}: ${errors.join(', ')}`);
    });
  }

  if (duplicates.length > 0) {
    console.error('❌ Doublons détectés:', duplicates.join(', '));
  }

  if (validation.invalid.length > 0 || duplicates.length > 0) {
    console.error('❌ Arrêt du script à cause d\'erreurs de configuration');
    process.exit(1);
  }

  console.log('✅ Configuration valide');

  try {
    // Synchronisation optimisée
    const startTime = Date.now();
    // Support --dry-run for the CLI
    const dryRun = process.argv.includes('--dry-run');
    if (dryRun) process.env.DRY_RUN = '1';

    const result = await service.syncAll({
      concurrency: parseInt(process.env.SYNC_CONCURRENCY || '10'),
      timeout: parseInt(process.env.SYNC_TIMEOUT || '30000')
    });

    const duration = Date.now() - startTime;

    console.log('\n📊 Résultats de la synchronisation:');
    console.log(`⏱️  Durée totale: ${duration}ms`);
    console.log(`✅ Succès: ${result.success.length}`);
    console.log(`❌ Échecs: ${result.failed.length}`);

    if (result.failed.length > 0) {
      console.log('\n❌ Détails des échecs:');
      result.failed.forEach(failure => {
        console.log(`  - ${failure.name}: ${failure.error}`);
      });
    }

    console.log('\n📈 Statistiques de performance:');
    console.log(`🚀 Requêtes totales: ${result.stats.totalRequests}`);
    console.log(`📦 Entrées en cache: ${result.stats.cacheHits}`);
    console.log(`⚡ Temps moyen par langage: ${Math.round(result.stats.duration / result.stats.totalRequests)}ms`);

    // Statistiques du cache
    const cacheStats = service.getCacheStats();
    console.log(`💾 Taille du cache: ${cacheStats.size} entrées`);

    console.log('\n🎉 Synchronisation terminée avec succès!');

  } catch (error) {
    console.error('💥 Erreur fatale lors de la synchronisation:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Gestion des signaux pour un arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt demandé (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt demandé (SIGTERM)');
  process.exit(0);
});

main().catch(error => {
  console.error('💥 Erreur non gérée:', error);
  process.exit(1);
});