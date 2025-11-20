import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkWebDomain() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🌐 LANGAGES ET TOOLS DU DOMAINE "WEB"\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Récupérer tous les éléments avec domain "web"
    const webItems = await langageModel
      .find({ domain: 'web' })
      .sort({ name: 1 })
      .exec();

    // Catégoriser par type
    const languages: any[] = [];
    const frameworks: any[] = [];
    const tools: any[] = [];
    const databases: any[] = [];
    const others: any[] = [];

    webItems.forEach((item: any) => {
      const domains = item.domain || [];
      if (domains.includes('language')) {
        languages.push(item);
      } else if (domains.includes('framework')) {
        frameworks.push(item);
      } else if (domains.includes('database')) {
        databases.push(item);
      } else if (domains.includes('tools')) {
        tools.push(item);
      } else {
        others.push(item);
      }
    });

    console.log(`📊 Total: ${webItems.length} éléments\n`);

    console.log('🔤 LANGAGES:');
    if (languages.length > 0) {
      languages.forEach((l: any) => {
        const version = l.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${l.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n🏗️ FRAMEWORKS:');
    if (frameworks.length > 0) {
      frameworks.forEach((f: any) => {
        const version = f.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${f.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n🗄️ DATABASES:');
    if (databases.length > 0) {
      databases.forEach((d: any) => {
        const version = d.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${d.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n🔧 TOOLS:');
    if (tools.length > 0) {
      tools.forEach((t: any) => {
        const version = t.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${t.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n📦 AUTRES:');
    if (others.length > 0) {
      others.forEach((o: any) => {
        const version = o.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${o.name} (${version}) - domains: ${o.domain.join(', ')}`);
      });
    } else {
      console.log('  (aucun)');
    }

    // Suggestions de technologies web manquantes
    console.log('\n\n💡 TECHNOLOGIES WEB POPULAIRES À VÉRIFIER:');
    console.log('═══════════════════════════════════════════════════════════\n');

    const existingNames = webItems.map((i: any) => i.name.toLowerCase());

    const suggestedWeb = {
      'Langages': ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'PHP', 'Ruby', 'Python', 'Go', 'Rust'],
      'Frameworks Frontend': ['React', 'Vue.js', 'Angular', 'Svelte', 'SolidJS', 'Qwik', 'Astro', 'Next.js', 'Nuxt', 'Remix', 'Gatsby'],
      'Frameworks Backend': ['Express.js', 'NestJS', 'Fastify', 'Koa', 'Hono', 'Laravel', 'Symfony', 'Django', 'Flask', 'FastAPI', 'Ruby on Rails', 'Spring Boot', 'ASP.NET'],
      'Frameworks CSS': ['Tailwind CSS', 'Bootstrap', 'Bulma', 'Foundation', 'Materialize'],
      'Build Tools': ['Webpack', 'Vite', 'esbuild', 'Parcel', 'Rollup', 'Turbopack'],
      'Package Managers': ['npm', 'Yarn', 'pnpm', 'Bun'],
      'Testing': ['Jest', 'Vitest', 'Cypress', 'Playwright', 'Mocha', 'Jasmine'],
      'State Management': ['Redux', 'Zustand', 'MobX', 'Pinia', 'Recoil', 'Jotai'],
      'API/GraphQL': ['GraphQL', 'Apollo', 'tRPC', 'Prisma'],
      'Databases': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Supabase', 'Firebase'],
      'CMS': ['WordPress', 'Strapi', 'Contentful', 'Sanity', 'Ghost'],
      'Servers': ['Nginx', 'Apache', 'Caddy'],
      'Runtime': ['Node.js', 'Deno', 'Bun']
    };

    for (const [category, items] of Object.entries(suggestedWeb)) {
      const missing = items.filter(item => !existingNames.includes(item.toLowerCase()));
      const present = items.filter(item => existingNames.includes(item.toLowerCase()));

      console.log(`${category}:`);
      if (present.length > 0) {
        console.log(`  ✅ Présents: ${present.join(', ')}`);
      }
      if (missing.length > 0) {
        console.log(`  ❌ Manquants: ${missing.join(', ')}`);
      }
      console.log('');
    }

  } finally {
    await app.close();
  }
}

checkWebDomain().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
