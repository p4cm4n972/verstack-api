import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixNewToolsSupportDuration() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 AJOUT DES SUPPORT DURATION POUR LES NOUVEAUX OUTILS WEB\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Valeurs à appliquer (en mois) - basées sur les politiques officielles
    const supportDurations: Record<string, Record<string, number>> = {
      // Build Tools - généralement support court
      'Vite': { 'current': 6 },
      'Webpack': { 'current': 12 },

      // Package Managers
      'npm': { 'current': 6 },
      'Yarn': { 'current': 12 },
      'pnpm': { 'current': 6 },

      // Testing - support modéré
      'Jest': { 'current': 12 },
      'Vitest': { 'current': 6 },
      'Cypress': { 'current': 12 },
      'Playwright': { 'current': 12 },

      // CSS & Frontend
      'Tailwind CSS': { 'current': 12 },
      'Redux': { 'current': 18 },
      'Zustand': { 'current': 12 },
      'Pinia': { 'current': 12 },

      // Backend Frameworks
      'Fastify': { 'current': 12 },
      'Flask': { 'current': 12 },
      'FastAPI': { 'current': 12 },
      'Ruby on Rails': { 'current': 12, 'lts': 36 },

      // API & ORM
      'GraphQL': { 'current': 24 },  // Spec stable
      'Prisma': { 'current': 12 },
      'tRPC': { 'current': 6 },

      // Server
      'Nginx': { 'current': 12 }
    };

    let updated = 0;
    let created = 0;

    for (const [toolName, versionDurations] of Object.entries(supportDurations)) {
      const tool = await langageModel.findOne({ name: toolName }).exec();

      if (!tool) {
        console.log(`❌ ${toolName}: Non trouvé`);
        continue;
      }

      let modified = false;

      // Si pas de versions, créer la version current
      if (!tool.versions || tool.versions.length === 0) {
        tool.versions = [];
        for (const [type, duration] of Object.entries(versionDurations)) {
          tool.versions.push({
            type,
            label: 'N/A',
            supportDuration: duration
          });
          console.log(`  ✅ ${toolName} - ${type}: ${duration} mois (créé)`);
          created++;
        }
        modified = true;
      } else {
        // Mettre à jour les versions existantes
        for (const version of tool.versions) {
          const duration = versionDurations[version.type];
          if (duration !== undefined) {
            version.supportDuration = duration;
            console.log(`  ✅ ${toolName} - ${version.type}: ${duration} mois`);
            modified = true;
          }
        }
      }

      if (modified) {
        await tool.save();
        updated++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Outils mis à jour: ${updated}`);
    console.log(`  • Versions créées: ${created}`);

  } finally {
    await app.close();
  }
}

fixNewToolsSupportDuration().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
