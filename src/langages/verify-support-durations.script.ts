import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function verifySupportDurations() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 VÉRIFICATION DES DURÉES DE SUPPORT (en mois)\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const langages = await langageModel.find({}).exec();

    // Durées officielles de support (en mois)
    const officialSupport: Record<string, {
      current?: number;
      lts?: number;
      note: string;
      source: string;
    }> = {
      'Node.js': {
        current: 6, // ~6 mois jusqu'à la prochaine LTS
        lts: 30, // 30 mois Active LTS (+ 18 mois Maintenance = 48 total, mais souvent on compte l'Active)
        note: '30 mois Active LTS + 18 mois Maintenance LTS = 48 mois total',
        source: 'https://github.com/nodejs/release'
      },
      'Python': {
        current: 60, // 5 ans = 60 mois
        lts: 60,
        note: 'Chaque version majeure/mineure: ~5 ans (60 mois)',
        source: 'https://devguide.python.org/versions/'
      },
      'Java': {
        current: 6, // Non-LTS: 6 mois
        lts: 96, // LTS: 8 ans minimum (Oracle), souvent plus
        note: 'Non-LTS: 6 mois, LTS: 96+ mois (8+ ans)',
        source: 'https://www.oracle.com/java/technologies/java-se-support-roadmap.html'
      },
      'PHP': {
        current: 36, // 2 ans Active + 1 an Security = 3 ans
        note: '24 mois Active Support + 12 mois Security Support = 36 mois',
        source: 'https://www.php.net/supported-versions.php'
      },
      '.NET': {
        current: 18, // STS (Standard Term Support): 18 mois
        lts: 36, // LTS: 3 ans = 36 mois
        note: 'LTS: 36 mois, STS (Current): 18 mois',
        source: 'https://dotnet.microsoft.com/platform/support/policy'
      },
      'Ruby': {
        current: 36, // ~3 ans
        note: 'Normal maintenance: ~36 mois (3 ans)',
        source: 'https://www.ruby-lang.org/en/downloads/branches/'
      },
      'Go': {
        current: 12, // 2 versions majeures × 6 mois = 12 mois
        note: 'Seules les 2 dernières versions majeures (~12 mois)',
        source: 'https://go.dev/doc/devel/release'
      },
      'Rust': {
        current: 1.5, // 6 semaines = ~1.5 mois (rolling release)
        note: 'Nouvelle version stable tous les 6 semaines (rolling)',
        source: 'https://blog.rust-lang.org/2014/10/30/Stability.html'
      },
      'Angular': {
        current: 6, // 6 mois active
        lts: 18, // 6 mois active + 12 mois LTS = 18 mois
        note: '6 mois Active + 12 mois LTS = 18 mois total',
        source: 'https://angular.dev/reference/versions'
      },
      'Vue.js': {
        current: 18, // 18 mois pour les versions majeures
        lts: 18,
        note: 'Versions majeures: ~18 mois',
        source: 'https://v2.vuejs.org/lts/'
      },
      'React': {
        current: 24, // Pas de politique officielle, mais ~2 ans entre majeures
        note: 'Pas de politique LTS officielle, versions majeures espacées (~24 mois)',
        source: 'https://react.dev/blog'
      },
      'TypeScript': {
        current: 12, // Pas de LTS, ~4 versions/an, support ~1 an
        note: 'Pas de LTS, support informel ~12 mois',
        source: 'https://devblogs.microsoft.com/typescript/'
      },
      'Unity': {
        lts: 24, // LTS: 2 ans = 24 mois
        current: 12, // Tech stream: ~1 an
        note: 'LTS: 24 mois (2 ans), Tech stream: ~12 mois',
        source: 'https://unity.com/releases/lts-vs-tech-stream'
      },
      'PostgreSQL': {
        current: 60, // 5 ans = 60 mois
        lts: 60,
        note: 'Chaque version majeure: 5 ans (60 mois)',
        source: 'https://www.postgresql.org/support/versioning/'
      },
      'MySQL': {
        current: 96, // 8 ans pour MySQL 8.x
        lts: 96,
        note: 'MySQL 8.x: 8 ans (96 mois)',
        source: 'https://www.mysql.com/support/'
      },
      'MariaDB': {
        current: 12, // Short-term: 1 an
        lts: 60, // Long-term: 5 ans
        note: 'Short-term: 12 mois, Long-term: 60 mois (5 ans)',
        source: 'https://mariadb.org/about/#maintenance-policy'
      },
      'MongoDB': {
        current: 12, // Rapid releases: ~1 an
        note: 'Rapid releases: ~12 mois',
        source: 'https://www.mongodb.com/support-policy'
      },
      'Redis': {
        current: 18, // ~18 mois par version majeure
        note: 'Support ~18 mois par version',
        source: 'https://redis.io/docs/about/releases/'
      },
      'Kubernetes': {
        current: 14, // ~14 mois (3 versions × ~4 mois + overlap)
        note: 'Support des 3 dernières versions mineures (~14 mois)',
        source: 'https://kubernetes.io/releases/patch-releases/'
      },
      'Docker': {
        current: 4, // ~4 mois entre versions
        note: 'Pas de LTS officiel, ~4 mois entre releases',
        source: 'https://docs.docker.com/engine/release-notes/'
      },
      'Laravel': {
        current: 12, // Non-LTS: 6 mois bugfix + 6 mois security
        lts: 24, // LTS: 2 ans bugfix + 3 ans security (on compte bugfix?)
        note: 'LTS: 24 mois bugfix + 36 mois security, Non-LTS: 6+6 mois',
        source: 'https://laravel.com/docs/releases'
      },
      'Symfony': {
        current: 8, // Non-LTS: 8 mois
        lts: 48, // LTS: 3 ans bugfix + 1 an security = 4 ans
        note: 'LTS: 48 mois (4 ans), Non-LTS: 8 mois',
        source: 'https://symfony.com/releases'
      },
      'Django': {
        current: 8, // ~8 mois entre versions
        lts: 36, // LTS: 3 ans
        note: 'LTS: 36 mois (3 ans), Non-LTS: ~8 mois',
        source: 'https://www.djangoproject.com/download/#supported-versions'
      },
      'Spring': {
        current: 12, // OSS support: 12 mois
        note: 'OSS support: 12 mois minimum',
        source: 'https://spring.io/projects/spring-framework#support'
      },
      'NestJS': {
        current: 12, // Pas de politique officielle, estimation ~12 mois
        note: 'Pas de politique LTS officielle, estimation ~12 mois',
        source: 'https://github.com/nestjs/nest/releases'
      },
      'Next.js': {
        current: 6, // Releases fréquentes, support ~6 mois
        note: 'Releases fréquentes, support estimé ~6 mois',
        source: 'https://nextjs.org/blog'
      },
      'Nuxt': {
        current: 6, // Releases fréquentes
        note: 'Support estimé ~6 mois',
        source: 'https://nuxt.com/blog'
      },
      'Electron': {
        current: 2, // Support des 4 dernières versions, release ~8 semaines
        note: 'Support des 4 dernières versions (~8 semaines × 4 = ~8 mois)',
        source: 'https://www.electronjs.org/docs/latest/tutorial/electron-timelines'
      },
      'Swift': {
        current: 12, // Pas de LTS officiel, ~1 an
        note: 'Pas de LTS officiel, estimation ~12 mois',
        source: 'https://swift.org/blog/'
      },
      'Kotlin': {
        current: 18, // Pas de LTS, mais support ~18 mois
        note: 'Support estimé ~18 mois',
        source: 'https://kotlinlang.org/docs/releases.html'
      },
      'Dart': {
        current: 12, // Pas de LTS, ~12 mois
        note: 'Support estimé ~12 mois',
        source: 'https://dart.dev/get-dart/archive'
      },
      'Flutter': {
        current: 12, // ~12 mois entre versions majeures
        note: 'Support estimé ~12 mois',
        source: 'https://docs.flutter.dev/release/archive'
      },
      'Bun': {
        current: 6, // Très actif, releases fréquentes
        note: 'Projet jeune, releases fréquentes, estimation ~6 mois',
        source: 'https://bun.sh/blog'
      },
      'Deno': {
        current: 6, // Releases fréquentes
        note: 'Releases fréquentes, estimation ~6 mois',
        source: 'https://deno.com/blog'
      },
      'PowerShell': {
        current: 12, // Non-LTS: 12 mois
        lts: 36, // LTS: 3 ans
        note: 'LTS: 36 mois, Non-LTS: 12 mois',
        source: 'https://learn.microsoft.com/powershell/scripting/install/powershell-support-lifecycle'
      },
      'Terraform': {
        current: 12, // Support estimé ~12 mois
        lts: 18, // Certaines versions ont support étendu
        note: 'Support standard ~12 mois, certaines versions 18+ mois',
        source: 'https://www.hashicorp.com/support'
      }
    };

    const issues: any[] = [];
    const correct: any[] = [];
    const missing: any[] = [];

    langages.forEach((lang: any) => {
      const expected = officialSupport[lang.name];
      if (!expected) return; // On ne vérifie que les langages avec référence

      const versions = lang.versions || [];
      const current = versions.find((v: any) => v.type === 'current');
      const lts = versions.find((v: any) => v.type === 'lts');

      // Vérifier current
      if (expected.current !== undefined) {
        if (current?.supportDuration === expected.current) {
          correct.push({
            language: lang.name,
            type: 'current',
            value: current.supportDuration,
            expected: expected.current,
            status: '✅'
          });
        } else if (current?.supportDuration !== undefined) {
          issues.push({
            language: lang.name,
            type: 'current',
            actual: current.supportDuration,
            expected: expected.current,
            note: expected.note,
            source: expected.source
          });
        } else {
          missing.push({
            language: lang.name,
            type: 'current',
            expected: expected.current,
            note: expected.note
          });
        }
      }

      // Vérifier LTS
      if (expected.lts !== undefined) {
        if (lts?.supportDuration === expected.lts) {
          correct.push({
            language: lang.name,
            type: 'lts',
            value: lts.supportDuration,
            expected: expected.lts,
            status: '✅'
          });
        } else if (lts?.supportDuration !== undefined) {
          issues.push({
            language: lang.name,
            type: 'lts',
            actual: lts.supportDuration,
            expected: expected.lts,
            note: expected.note,
            source: expected.source
          });
        } else {
          missing.push({
            language: lang.name,
            type: 'lts',
            expected: expected.lts,
            note: expected.note
          });
        }
      }
    });

    console.log('📊 RÉSULTATS:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`  ✅ Valeurs correctes: ${correct.length}`);
    console.log(`  ⚠️  Valeurs incorrectes: ${issues.length}`);
    console.log(`  ❌ Valeurs manquantes: ${missing.length}\n`);

    if (issues.length > 0) {
      console.log('\n⚠️  VALEURS INCORRECTES:');
      console.log('═══════════════════════════════════════════════════════════\n');

      issues.forEach((issue) => {
        console.log(`🔹 ${issue.language} (${issue.type}):`);
        console.log(`   En base: ${issue.actual} mois`);
        console.log(`   Attendu: ${issue.expected} mois`);
        console.log(`   Note: ${issue.note}`);
        console.log(`   Source: ${issue.source}`);
        console.log('');
      });
    }

    if (missing.length > 0) {
      console.log('\n❌ VALEURS MANQUANTES:');
      console.log('═══════════════════════════════════════════════════════════\n');

      missing.forEach((miss) => {
        console.log(`🔹 ${miss.language} (${miss.type}):`);
        console.log(`   Devrait être: ${miss.expected} mois`);
        console.log(`   Note: ${miss.note}`);
        console.log('');
      });
    }

    if (correct.length > 0) {
      console.log('\n✅ VALEURS CORRECTES (exemples):');
      console.log('─────────────────────────────────────────────────────────\n');

      correct.slice(0, 10).forEach((c) => {
        console.log(`  • ${c.language} (${c.type}): ${c.value} mois ✅`);
      });

      if (correct.length > 10) {
        console.log(`  ... et ${correct.length - 10} autres valeurs correctes`);
      }
    }

  } finally {
    await app.close();
  }
}

verifySupportDurations().catch(error => {
  console.error('❌ Erreur lors de la vérification:', error);
  process.exit(1);
});
