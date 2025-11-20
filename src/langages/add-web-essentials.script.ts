import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function addWebEssentials() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🌐 AJOUT DES ESSENTIELS ET IMPORTANTS POUR LE DOMAINE WEB\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Définition des éléments à ajouter/mettre à jour
    const webItems = [
      // === ESSENTIELS ===
      // Langages
      {
        name: 'CSS',
        domain: ['web', 'frontend', 'language'],
        description: 'Langage de feuilles de style pour la mise en forme des documents HTML',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
        documentation: 'https://developer.mozilla.org/fr/docs/Web/CSS',
        initialRelease: '1996',
        versions: [{ type: 'livingStandard', label: 'Living Standard' }]
      },
      // Databases - update domain only
      { name: 'PostgreSQL', addWebOnly: true },
      { name: 'MySQL', addWebOnly: true },
      {
        name: 'Redis',
        domain: ['web', 'backend', 'database'],
        description: 'Base de données in-memory pour le cache et les messages',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
        documentation: 'https://redis.io/docs/',
        initialRelease: '2009',
        versions: []
      },
      // Build Tools
      {
        name: 'Vite',
        domain: ['web', 'frontend', 'tools'],
        description: 'Outil de build rapide pour les projets web modernes',
        logoUrl: 'https://vitejs.dev/logo.svg',
        documentation: 'https://vitejs.dev/guide/',
        initialRelease: '2020',
        versions: []
      },
      {
        name: 'Webpack',
        domain: ['web', 'frontend', 'tools'],
        description: 'Module bundler pour JavaScript',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg',
        documentation: 'https://webpack.js.org/concepts/',
        initialRelease: '2012',
        versions: []
      },
      // Package Managers
      {
        name: 'npm',
        domain: ['web', 'tools'],
        description: 'Gestionnaire de paquets par défaut pour Node.js',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg',
        documentation: 'https://docs.npmjs.com/',
        initialRelease: '2010',
        versions: []
      },
      {
        name: 'Yarn',
        domain: ['web', 'tools'],
        description: 'Gestionnaire de paquets rapide et sécurisé',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/yarn/yarn-original.svg',
        documentation: 'https://yarnpkg.com/getting-started',
        initialRelease: '2016',
        versions: []
      },
      {
        name: 'pnpm',
        domain: ['web', 'tools'],
        description: 'Gestionnaire de paquets rapide et économe en espace disque',
        logoUrl: 'https://pnpm.io/img/pnpm-no-name-with-frame.svg',
        documentation: 'https://pnpm.io/motivation',
        initialRelease: '2017',
        versions: []
      },
      // Testing
      {
        name: 'Jest',
        domain: ['web', 'tools'],
        description: 'Framework de test JavaScript avec zero configuration',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg',
        documentation: 'https://jestjs.io/docs/getting-started',
        initialRelease: '2014',
        versions: []
      },
      {
        name: 'Vitest',
        domain: ['web', 'tools'],
        description: 'Framework de test ultra-rapide alimenté par Vite',
        logoUrl: 'https://vitest.dev/logo.svg',
        documentation: 'https://vitest.dev/guide/',
        initialRelease: '2021',
        versions: []
      },
      {
        name: 'Cypress',
        domain: ['web', 'tools'],
        description: 'Framework de test end-to-end pour applications web',
        logoUrl: 'https://asset.brandfetch.io/idIq_kF0rb/idv3zwmSiY.jpeg',
        documentation: 'https://docs.cypress.io/',
        initialRelease: '2017',
        versions: []
      },
      {
        name: 'Playwright',
        domain: ['web', 'tools'],
        description: 'Framework de test end-to-end par Microsoft',
        logoUrl: 'https://playwright.dev/img/playwright-logo.svg',
        documentation: 'https://playwright.dev/docs/intro',
        initialRelease: '2020',
        versions: []
      },
      // CSS Frameworks
      {
        name: 'Tailwind CSS',
        domain: ['web', 'frontend', 'framework'],
        description: 'Framework CSS utility-first pour un développement rapide',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
        documentation: 'https://tailwindcss.com/docs',
        initialRelease: '2017',
        versions: []
      },

      // === IMPORTANTS ===
      // Backend Frameworks
      {
        name: 'Fastify',
        domain: ['web', 'backend', 'framework'],
        description: 'Framework web Node.js rapide et low overhead',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastify/fastify-original.svg',
        documentation: 'https://www.fastify.io/docs/latest/',
        initialRelease: '2016',
        versions: []
      },
      {
        name: 'Flask',
        domain: ['web', 'backend', 'framework'],
        description: 'Micro-framework web Python léger et flexible',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
        documentation: 'https://flask.palletsprojects.com/en/stable/',
        initialRelease: '2010',
        versions: []
      },
      {
        name: 'FastAPI',
        domain: ['web', 'backend', 'framework'],
        description: 'Framework Python moderne et rapide pour les APIs',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg',
        documentation: 'https://fastapi.tiangolo.com/',
        initialRelease: '2018',
        versions: []
      },
      {
        name: 'Ruby on Rails',
        domain: ['web', 'backend', 'framework'],
        description: 'Framework web full-stack en Ruby',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rails/rails-plain.svg',
        documentation: 'https://guides.rubyonrails.org/',
        initialRelease: '2004',
        versions: []
      },
      // API/ORM
      {
        name: 'GraphQL',
        domain: ['web', 'backend', 'tools'],
        description: 'Langage de requête pour APIs',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg',
        documentation: 'https://graphql.org/learn/',
        initialRelease: '2015',
        versions: [{ type: 'current', label: 'October 2021' }]
      },
      {
        name: 'Prisma',
        domain: ['web', 'backend', 'tools'],
        description: 'ORM moderne pour Node.js et TypeScript',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/prisma/prisma-original.svg',
        documentation: 'https://www.prisma.io/docs',
        initialRelease: '2019',
        versions: []
      },
      {
        name: 'tRPC',
        domain: ['web', 'backend', 'tools'],
        description: 'APIs type-safe end-to-end pour TypeScript',
        logoUrl: 'https://trpc.io/img/logo.svg',
        documentation: 'https://trpc.io/docs',
        initialRelease: '2020',
        versions: []
      },
      // State Management
      {
        name: 'Redux',
        domain: ['web', 'frontend', 'tools'],
        description: 'Conteneur d\'état prévisible pour JavaScript',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg',
        documentation: 'https://redux.js.org/introduction/getting-started',
        initialRelease: '2015',
        versions: []
      },
      {
        name: 'Zustand',
        domain: ['web', 'frontend', 'tools'],
        description: 'Gestion d\'état légère et simple pour React',
        logoUrl: 'https://zustand-demo.pmnd.rs/favicon.ico',
        documentation: 'https://docs.pmnd.rs/zustand/getting-started/introduction',
        initialRelease: '2019',
        versions: []
      },
      {
        name: 'Pinia',
        domain: ['web', 'frontend', 'tools'],
        description: 'Store officiel pour Vue.js',
        logoUrl: 'https://pinia.vuejs.org/logo.svg',
        documentation: 'https://pinia.vuejs.org/introduction.html',
        initialRelease: '2019',
        versions: []
      },
      // Server
      {
        name: 'Nginx',
        domain: ['web', 'devops', 'tools'],
        description: 'Serveur web et reverse proxy haute performance',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg',
        documentation: 'https://nginx.org/en/docs/',
        initialRelease: '2004',
        versions: []
      }
    ];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of webItems) {
      const existing = await langageModel.findOne({ name: item.name }).exec();

      if (existing) {
        if (item.addWebOnly) {
          // Just add 'web' to domain if not present
          if (!existing.domain.includes('web')) {
            await langageModel.updateOne(
              { name: item.name },
              { $addToSet: { domain: 'web' } }
            ).exec();
            console.log(`  ✅ ${item.name}: domaine 'web' ajouté`);
            updated++;
          } else {
            console.log(`  ⏭️  ${item.name}: déjà dans le domaine web`);
            skipped++;
          }
        } else {
          // Update domains if needed
          const newDomains = [...new Set([...existing.domain, ...(item.domain || [])])];
          if (newDomains.length !== existing.domain.length) {
            await langageModel.updateOne(
              { name: item.name },
              { $set: { domain: newDomains } }
            ).exec();
            console.log(`  ✅ ${item.name}: domaines mis à jour`);
            updated++;
          } else {
            console.log(`  ⏭️  ${item.name}: existe déjà avec les bons domaines`);
            skipped++;
          }
        }
      } else {
        // Create new entry
        if (!item.addWebOnly) {
          const newItem = {
            name: item.name,
            domain: item.domain,
            description: item.description || '',
            logoUrl: item.logoUrl || '',
            documentation: item.documentation || '',
            initialRelease: item.initialRelease || '',
            versions: item.versions || [],
            recommendations: 0
          };

          await langageModel.create(newItem);
          console.log(`  ✅ ${item.name}: créé`);
          created++;
        } else {
          console.log(`  ⚠️  ${item.name}: n'existe pas en base (addWebOnly=true)`);
          skipped++;
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Créés: ${created}`);
    console.log(`  • Mis à jour: ${updated}`);
    console.log(`  • Ignorés: ${skipped}`);
    console.log(`  • Total traité: ${webItems.length}`);

  } finally {
    await app.close();
  }
}

addWebEssentials().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
