import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

async function checkBrokenLogos() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');
    const httpService = app.get(HttpService);

    console.log('🔍 VÉRIFICATION DES LOGOS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Récupérer tous les items avec leurs logos
    const allItems = await langageModel.find({}).sort({ name: 1 }).exec();

    const brokenLogos: any[] = [];
    const suspiciousLogos: any[] = [];
    let checked = 0;

    for (const item of allItems) {
      if (!item.logoUrl || item.logoUrl === '') {
        brokenLogos.push({
          name: item.name,
          domains: item.domain.join(', '),
          reason: 'Pas de logoUrl'
        });
        continue;
      }

      checked++;

      // Vérifier si l'URL semble valide
      try {
        const url = new URL(item.logoUrl);

        // Vérifier les extensions d'image valides
        const validExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
        const hasValidExtension = validExtensions.some(ext =>
          url.pathname.toLowerCase().includes(ext)
        );

        // Patterns suspects
        const isSuspicious =
          url.pathname.includes('share') ||
          url.pathname.includes('social') ||
          url.pathname.includes('og_image') ||
          url.pathname.includes('default') ||
          url.hostname.includes('wikimedia') ||
          url.hostname.includes('wikipedia');

        if (isSuspicious) {
          suspiciousLogos.push({
            name: item.name,
            domains: item.domain.join(', '),
            logoUrl: item.logoUrl,
            reason: 'URL suspecte (peut être trop large ou og:image)'
          });
        }

        // Test HTTP (optionnel, peut être lent)
        // On va juste logger sans tester HTTP pour l'instant

      } catch (error) {
        brokenLogos.push({
          name: item.name,
          domains: item.domain.join(', '),
          logoUrl: item.logoUrl,
          reason: 'URL invalide'
        });
      }
    }

    console.log(`📊 Total vérifié: ${checked} éléments\n`);

    if (brokenLogos.length > 0) {
      console.log(`\n❌ LOGOS MANQUANTS OU INVALIDES (${brokenLogos.length}):\n`);
      brokenLogos.forEach(item => {
        console.log(`  • ${item.name} (${item.domains})`);
        console.log(`    Raison: ${item.reason}`);
        if (item.logoUrl) {
          console.log(`    URL: ${item.logoUrl}`);
        }
        console.log('');
      });
    }

    if (suspiciousLogos.length > 0) {
      console.log(`\n⚠️  LOGOS SUSPECTS (${suspiciousLogos.length}):\n`);
      suspiciousLogos.forEach(item => {
        console.log(`  • ${item.name} (${item.domains})`);
        console.log(`    Raison: ${item.reason}`);
        console.log(`    URL: ${item.logoUrl}`);
        console.log('');
      });
    }

    if (brokenLogos.length === 0 && suspiciousLogos.length === 0) {
      console.log('\n✅ Tous les logos semblent corrects!\n');
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\nRésumé:`);
    console.log(`  • Total vérifié: ${checked}`);
    console.log(`  • Logos manquants/invalides: ${brokenLogos.length}`);
    console.log(`  • Logos suspects: ${suspiciousLogos.length}`);

  } finally {
    await app.close();
  }
}

checkBrokenLogos().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
