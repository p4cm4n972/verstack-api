import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixBrokenLogos() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES LOGOS CASSÉS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Map des logos à corriger
    const logoFixes: Record<string, string> = {
      'Crystal': 'https://crystal-lang.org/assets/crystal-h-dark.svg',
      'Delphi': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Embarcadero_Delphi_Logo.png',
      'Deno': 'https://deno.land/logo.svg',
      'Django': 'https://static.djangoproject.com/img/logos/django-logo-negative.svg',
      'Docker': 'https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png',
      'F#': 'https://upload.wikimedia.org/wikipedia/commons/6/66/F_Sharp_logo.svg',
      'Flutter': 'https://storage.googleapis.com/cms-storage-bucket/0dbfcc7a59cd1cf16282.png',
      'Fortran': 'https://fortran-lang.org/assets/img/fortran-logo.png',
      'Groovy': 'https://groovy-lang.org/img/groovy-logo-colored.svg',
      'Julia': 'https://julialang.org/assets/infra/logo.svg',
      'Lua': 'https://www.lua.org/images/logo.gif',
      'MariaDB': 'https://mariadb.com/wp-content/uploads/2019/11/mariadb-logo-vertical_blue.svg',
      'MongoDB': 'https://www.mongodb.com/assets/images/global/favicon.ico',
      'OCaml': 'https://ocaml.org/logo.svg',
      'Perl': 'https://www.perl.org/static/images/camel_head.png',
      'PowerShell': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/PowerShell_5.0_icon.png',
      'ReScript': 'https://rescript-lang.org/static/logo_small.png',
      'Redis': 'https://redis.io/images/redis-white.png',
      'Rust': 'https://www.rust-lang.org/static/images/rust-logo-blk.svg',
      'Scala': 'https://www.scala-lang.org/resources/img/frontpage/scala-logo.png',
      'Symfony': 'https://symfony.com/logos/symfony_black_02.svg',
      'Unity': 'https://unity.com/logo-unity-web.png',
      'V': 'https://vlang.io/img/v-logo.png',
      'VBA': 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Visual_Basic.png'
    };

    let updated = 0;
    let failed = 0;

    for (const [name, newLogoUrl] of Object.entries(logoFixes)) {
      try {
        const result = await langageModel.updateOne(
          { name },
          { $set: { logoUrl: newLogoUrl } }
        ).exec();

        if (result.matchedCount > 0) {
          console.log(`  ✅ ${name}: logo mis à jour`);
          console.log(`     ${newLogoUrl}`);
          updated++;
        } else {
          console.log(`  ⚠️  ${name}: non trouvé`);
          failed++;
        }
      } catch (error) {
        console.log(`  ❌ ${name}: erreur lors de la mise à jour`);
        failed++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Logos mis à jour: ${updated}`);
    console.log(`  • Échecs: ${failed}`);

  } finally {
    await app.close();
  }
}

fixBrokenLogos().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
