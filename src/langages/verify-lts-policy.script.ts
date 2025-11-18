import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function verifyLtsPolicy() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('🔍 VÉRIFICATION DES POLITIQUES LTS OFFICIELLES\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Politiques LTS officielles (vérifiées sur les sites officiels)
    const officialLtsPolicy: Record<string, {
      hasLts: boolean;
      explanation: string;
      source: string;
    }> = {
      // Langages de programmation
      'Node.js': {
        hasLts: true,
        explanation: 'LTS releases (even versions: 18, 20, 22, etc.) avec 30 mois Active + 18 mois Maintenance',
        source: 'https://github.com/nodejs/release'
      },
      'Python': {
        hasLts: false,
        explanation: 'Pas de distinction LTS/Current - toutes les versions ont ~5 ans de support',
        source: 'https://devguide.python.org/versions/'
      },
      'Java': {
        hasLts: true,
        explanation: 'LTS versions: 8, 11, 17, 21 (support 8+ ans), Non-LTS: 6 mois',
        source: 'https://www.oracle.com/java/technologies/java-se-support-roadmap.html'
      },
      'PHP': {
        hasLts: false,
        explanation: 'Pas de LTS - toutes versions: 2 ans Active + 1 an Security',
        source: 'https://www.php.net/supported-versions.php'
      },
      '.NET': {
        hasLts: true,
        explanation: 'LTS (36 mois) vs STS/Current (18 mois)',
        source: 'https://dotnet.microsoft.com/platform/support/policy'
      },
      'C#': {
        hasLts: true,
        explanation: 'Suit .NET - LTS (36 mois) vs STS (18 mois)',
        source: 'https://dotnet.microsoft.com/platform/support/policy'
      },
      'F#': {
        hasLts: true,
        explanation: 'Suit .NET - LTS (36 mois) vs STS (18 mois)',
        source: 'https://dotnet.microsoft.com/platform/support/policy'
      },
      'Ruby': {
        hasLts: false,
        explanation: 'Pas de LTS officiel - toutes versions: ~3 ans',
        source: 'https://www.ruby-lang.org/en/downloads/branches/'
      },
      'Go': {
        hasLts: false,
        explanation: 'Pas de LTS - seules 2 dernières versions majeures supportées',
        source: 'https://go.dev/doc/devel/release'
      },
      'Rust': {
        hasLts: false,
        explanation: 'Pas de LTS - rolling release (6 semaines)',
        source: 'https://blog.rust-lang.org/2014/10/30/Stability.html'
      },
      'Swift': {
        hasLts: false,
        explanation: 'Pas de LTS officiel',
        source: 'https://swift.org/blog/'
      },
      'Kotlin': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://kotlinlang.org/docs/releases.html'
      },
      'Scala': {
        hasLts: false,
        explanation: 'Pas de LTS - mais 2.x et 3.x maintenus en parallèle',
        source: 'https://www.scala-lang.org/blog/'
      },
      'Dart': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://dart.dev/get-dart/archive'
      },
      'TypeScript': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://devblogs.microsoft.com/typescript/'
      },
      'Perl': {
        hasLts: false,
        explanation: 'Pas de LTS formel',
        source: 'https://www.perl.org/'
      },
      'Lua': {
        hasLts: false,
        explanation: 'Pas de LTS - versions majeures (5.1, 5.2, 5.3, 5.4) maintenues longtemps',
        source: 'https://www.lua.org/versions.html'
      },
      'Erlang': {
        hasLts: false,
        explanation: 'Pas de LTS officiel',
        source: 'https://www.erlang.org/downloads'
      },
      'Elixir': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://elixir-lang.org/blog/'
      },
      'Haskell': {
        hasLts: false,
        explanation: 'Pas de LTS (GHC releases)',
        source: 'https://www.haskell.org/ghc/'
      },
      'OCaml': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://ocaml.org/releases'
      },
      'Clojure': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://clojure.org/'
      },
      'Groovy': {
        hasLts: true,
        explanation: 'Versions 3.x LTS et 4.x current',
        source: 'https://groovy-lang.org/download.html'
      },
      'Julia': {
        hasLts: false,
        explanation: 'Pas de LTS formel',
        source: 'https://julialang.org/downloads/'
      },
      'R': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://www.r-project.org/'
      },

      // Frameworks web
      'Angular': {
        hasLts: true,
        explanation: 'Versions paires (14, 16, 18, 20) = LTS (18 mois total)',
        source: 'https://angular.dev/reference/versions'
      },
      'React': {
        hasLts: false,
        explanation: 'Pas de politique LTS officielle',
        source: 'https://react.dev/blog'
      },
      'Vue.js': {
        hasLts: true,
        explanation: 'Vue 2 est en LTS, Vue 3 est current',
        source: 'https://v2.vuejs.org/lts/'
      },
      'Svelte': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://svelte.dev/blog'
      },
      'Next.js': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://nextjs.org/blog'
      },
      'Nuxt': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://nuxt.com/blog'
      },
      'Django': {
        hasLts: true,
        explanation: 'LTS versions (2.2, 3.2, 4.2, 5.2) avec 3 ans de support',
        source: 'https://www.djangoproject.com/download/#supported-versions'
      },
      'Laravel': {
        hasLts: true,
        explanation: 'Certaines versions LTS (6.x, 9.x, 11.x) avec support étendu',
        source: 'https://laravel.com/docs/releases'
      },
      'Symfony': {
        hasLts: true,
        explanation: 'Versions LTS (4.4, 5.4, 6.4, 7.2) avec 4 ans de support',
        source: 'https://symfony.com/releases'
      },
      'Spring': {
        hasLts: false,
        explanation: 'Pas de LTS formel - OSS support 12 mois, commercial support disponible',
        source: 'https://spring.io/projects/spring-framework#support'
      },
      'Express.js': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://expressjs.com/'
      },
      'NestJS': {
        hasLts: false,
        explanation: 'Pas de politique LTS',
        source: 'https://github.com/nestjs/nest'
      },
      'Astro': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://astro.build/blog/'
      },
      'SolidJS': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://www.solidjs.com/'
      },
      'Qwik': {
        hasLts: false,
        explanation: 'Pas de LTS (projet récent)',
        source: 'https://qwik.dev/'
      },

      // Bases de données
      'PostgreSQL': {
        hasLts: false,
        explanation: 'Pas de distinction LTS - chaque version majeure: 5 ans',
        source: 'https://www.postgresql.org/support/versioning/'
      },
      'MySQL': {
        hasLts: true,
        explanation: 'MySQL 8.0 = LTS (8 ans), 8.3+ = Innovation (2 ans)',
        source: 'https://www.mysql.com/support/'
      },
      'MariaDB': {
        hasLts: true,
        explanation: 'Short-term (1 an) vs Long-term (5 ans)',
        source: 'https://mariadb.org/about/#maintenance-policy'
      },
      'MongoDB': {
        hasLts: false,
        explanation: 'Pas de LTS formel - Rapid releases',
        source: 'https://www.mongodb.com/support-policy'
      },
      'Redis': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://redis.io/docs/about/releases/'
      },

      // Outils et autres
      'Unity': {
        hasLts: true,
        explanation: 'LTS (2 ans) vs Tech Stream (1 an)',
        source: 'https://unity.com/releases/lts-vs-tech-stream'
      },
      'Flutter': {
        hasLts: false,
        explanation: 'Pas de LTS - Stable, Beta, Main channels',
        source: 'https://docs.flutter.dev/release/archive'
      },
      'Electron': {
        hasLts: false,
        explanation: 'Pas de LTS - support des 4 dernières versions',
        source: 'https://www.electronjs.org/docs/latest/tutorial/electron-timelines'
      },
      'Kubernetes': {
        hasLts: false,
        explanation: 'Pas de LTS - support des 3 dernières versions mineures',
        source: 'https://kubernetes.io/releases/patch-releases/'
      },
      'Docker': {
        hasLts: false,
        explanation: 'Pas de LTS officiel',
        source: 'https://docs.docker.com/engine/release-notes/'
      },
      'Terraform': {
        hasLts: false,
        explanation: 'Pas de LTS formel (mais certaines versions ont support étendu)',
        source: 'https://www.hashicorp.com/support'
      },
      'Ansible': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://docs.ansible.com/ansible/latest/reference_appendices/release_and_maintenance.html'
      },
      'PowerShell': {
        hasLts: true,
        explanation: 'LTS (3 ans) vs Stable (18 mois)',
        source: 'https://learn.microsoft.com/powershell/scripting/install/powershell-support-lifecycle'
      },
      'Bash': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://www.gnu.org/software/bash/'
      },
      'Bun': {
        hasLts: false,
        explanation: 'Pas de LTS (projet récent)',
        source: 'https://bun.sh/blog'
      },
      'Deno': {
        hasLts: false,
        explanation: 'Pas de LTS',
        source: 'https://deno.com/blog'
      }
    };

    // Charger la config
    const { SYNC_LANGAGES } = await import('./langage-sync.config');

    const correct: any[] = [];
    const incorrect: any[] = [];
    const notInReference: any[] = [];

    SYNC_LANGAGES.forEach((config: any) => {
      const official = officialLtsPolicy[config.nameInDb];

      if (!official) {
        notInReference.push({
          name: config.nameInDb,
          ltsSupport: config.ltsSupport
        });
        return;
      }

      const configHasLts = config.ltsSupport === true;
      const officialHasLts = official.hasLts;

      if (configHasLts === officialHasLts) {
        correct.push({
          name: config.nameInDb,
          ltsSupport: config.ltsSupport,
          official: official.hasLts,
          explanation: official.explanation
        });
      } else {
        incorrect.push({
          name: config.nameInDb,
          configLtsSupport: config.ltsSupport,
          officialHasLts: official.hasLts,
          explanation: official.explanation,
          source: official.source
        });
      }
    });

    console.log('📊 RÉSULTATS:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`  ✅ Configurations correctes: ${correct.length}`);
    console.log(`  ❌ Configurations incorrectes: ${incorrect.length}`);
    console.log(`  ⚠️  Langages non référencés: ${notInReference.length}\n`);

    if (incorrect.length > 0) {
      console.log('\n❌ CONFIGURATIONS INCORRECTES:');
      console.log('═══════════════════════════════════════════════════════════\n');

      incorrect.forEach((lang) => {
        console.log(`🔹 ${lang.name}:`);
        console.log(`   Config: ltsSupport = ${lang.configLtsSupport}`);
        console.log(`   Officiel: hasLts = ${lang.officialHasLts}`);
        console.log(`   ❌ INCOHÉRENCE`);
        console.log(`   📋 Explication: ${lang.explanation}`);
        console.log(`   🔗 Source: ${lang.source}`);
        console.log('');
      });
    }

    if (notInReference.length > 0) {
      console.log('\n⚠️  LANGAGES NON RÉFÉRENCÉS (à vérifier manuellement):');
      console.log('═══════════════════════════════════════════════════════════\n');

      notInReference.forEach((lang) => {
        console.log(`  • ${lang.name} (ltsSupport: ${lang.ltsSupport})`);
      });
      console.log('');
    }

    if (correct.length > 0) {
      console.log('\n✅ CONFIGURATIONS CORRECTES (exemples):');
      console.log('─────────────────────────────────────────────────────────\n');

      correct.slice(0, 15).forEach((lang) => {
        console.log(`  • ${lang.name}: ltsSupport=${lang.ltsSupport} ✅`);
        console.log(`    → ${lang.explanation}`);
      });

      if (correct.length > 15) {
        console.log(`\n  ... et ${correct.length - 15} autres configurations correctes`);
      }
    }

    if (incorrect.length > 0) {
      console.log('\n\n💡 ACTIONS RECOMMANDÉES:');
      console.log('═══════════════════════════════════════════════════════════\n');

      incorrect.forEach((lang) => {
        if (lang.officialHasLts && !lang.configLtsSupport) {
          console.log(`🔹 ${lang.name}:`);
          console.log(`   → Passer ltsSupport de false à true`);
          console.log(`   → ${lang.explanation}\n`);
        } else if (!lang.officialHasLts && lang.configLtsSupport) {
          console.log(`🔹 ${lang.name}:`);
          console.log(`   → Passer ltsSupport de true à false`);
          console.log(`   → ${lang.explanation}\n`);
        }
      });
    }

  } finally {
    await app.close();
  }
}

verifyLtsPolicy().catch(error => {
  console.error('❌ Erreur lors de la vérification:', error);
  process.exit(1);
});
