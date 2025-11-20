import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Model } from 'mongoose';

async function syncNewWebTools() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const service = app.get(LangageUpdateOptimizedService);
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔄 SYNCHRONISATION DES NOUVEAUX OUTILS WEB\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { SYNC_LANGAGES } = await import('./langage-sync.config');

    // Liste des nouveaux outils à synchroniser
    const newTools = [
      'CSS', 'Vite', 'Webpack', 'npm', 'Yarn', 'pnpm',
      'Jest', 'Vitest', 'Cypress', 'Playwright',
      'Tailwind CSS', 'Redux', 'Zustand', 'Pinia',
      'Fastify', 'Flask', 'FastAPI', 'Ruby on Rails',
      'Prisma', 'tRPC', 'Nginx'
    ];

    const results: any[] = [];

    for (const toolName of newTools) {
      const config = SYNC_LANGAGES.find((c: any) => c.nameInDb === toolName);

      if (!config) {
        console.log(`⚠️  ${toolName}: Configuration introuvable`);
        results.push({ name: toolName, status: 'no-config', version: null });
        continue;
      }

      console.log(`🔄 ${toolName}...`);

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

        const lang = await langageModel.findOne({ name: toolName }).exec();
        const current = lang?.versions?.find((v: any) => v.type === 'current')?.label;
        const livingStandard = lang?.versions?.find((v: any) => v.type === 'livingStandard')?.label;

        results.push({
          name: toolName,
          status: 'success',
          version: current || livingStandard || 'N/A'
        });

      } catch (error: any) {
        console.log(`   ❌ Erreur: ${error.message}`);
        results.push({
          name: toolName,
          status: 'error',
          version: null,
          error: error.message
        });
      }
    }

    // Résumé
    console.log('\n\n📊 RÉSUMÉ DE LA SYNCHRONISATION:');
    console.log('═══════════════════════════════════════════════════════════\n');

    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'error');
    const noConfig = results.filter(r => r.status === 'no-config');

    console.log('✅ Succès:');
    successful.forEach(r => {
      console.log(`   ${r.name}: ${r.version}`);
    });

    if (failed.length > 0) {
      console.log('\n❌ Échecs:');
      failed.forEach(r => {
        console.log(`   ${r.name}: ${r.error}`);
      });
    }

    if (noConfig.length > 0) {
      console.log('\n⚠️ Sans configuration:');
      noConfig.forEach(r => {
        console.log(`   ${r.name}`);
      });
    }

    console.log(`\n📈 Total: ${successful.length}/${results.length} synchronisés`);

  } finally {
    await app.close();
  }
}

syncNewWebTools().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
