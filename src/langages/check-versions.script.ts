import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Langage } from './entities/langage.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as semver from 'semver';
import { SYNC_LANGAGES } from './langage-sync.config';
import { CUSTOM_UPDATERS } from './custom-updaters';

interface VersionComparison {
  name: string;
  dbVersion: {
    current?: string;
    lts?: string;
    edition?: string;
    standard?: string;
    livingStandard?: string;
  };
  sourceVersion: {
    current?: string;
    lts?: string;
    edition?: string;
    standard?: string;
    livingStandard?: string;
  };
  issues: string[];
}

async function checkVersions() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<Langage>>('LangageModel');
    const httpService = app.get(HttpService);

    console.log('🔍 Vérification des versions des langages...\n');

    const allLangages = await langageModel.find().exec();
    const comparisons: VersionComparison[] = [];

    for (const config of SYNC_LANGAGES) {
      const dbLangage = allLangages.find(l => l.name === config.nameInDb);

      if (!dbLangage) {
        console.log(`⚠️  ${config.nameInDb} - Introuvable en base de données`);
        continue;
      }

      const comparison: VersionComparison = {
        name: config.nameInDb,
        dbVersion: {},
        sourceVersion: {},
        issues: []
      };

      // Extraire les versions de la DB
      for (const v of dbLangage.versions || []) {
        comparison.dbVersion[v.type] = v.label;
      }

      // Récupérer les versions depuis la source
      try {
        const sourceVersions = await getSourceVersions(config, httpService);
        comparison.sourceVersion = sourceVersions;

        // Comparer les versions
        compareVersions(comparison);

      } catch (error: any) {
        comparison.issues.push(`Erreur lors de la récupération: ${error.message}`);
      }

      comparisons.push(comparison);

      // Afficher les résultats pour ce langage
      displayComparison(comparison);
    }

    // Résumé
    console.log('\n📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════════════════════════');
    const withIssues = comparisons.filter(c => c.issues.length > 0);
    const withoutIssues = comparisons.filter(c => c.issues.length === 0);

    console.log(`✅ Langages sans incohérence: ${withoutIssues.length}`);
    console.log(`❌ Langages avec incohérence: ${withIssues.length}\n`);

    if (withIssues.length > 0) {
      console.log('Langages avec problèmes:');
      withIssues.forEach(c => {
        console.log(`  - ${c.name}: ${c.issues.join(', ')}`);
      });
    }

  } finally {
    await app.close();
  }
}

function displayComparison(comparison: VersionComparison) {
  const hasIssues = comparison.issues.length > 0;
  const icon = hasIssues ? '❌' : '✅';

  console.log(`${icon} ${comparison.name}`);
  console.log('─────────────────────────────────────────────────────────');

  if (comparison.dbVersion.current || comparison.sourceVersion.current) {
    console.log(`  Current:  DB="${comparison.dbVersion.current || 'N/A'}" | Source="${comparison.sourceVersion.current || 'N/A'}"`);
  }

  if (comparison.dbVersion.lts || comparison.sourceVersion.lts) {
    console.log(`  LTS:      DB="${comparison.dbVersion.lts || 'N/A'}" | Source="${comparison.sourceVersion.lts || 'N/A'}"`);
  }

  if (comparison.dbVersion.edition || comparison.sourceVersion.edition) {
    console.log(`  Edition:  DB="${comparison.dbVersion.edition || 'N/A'}" | Source="${comparison.sourceVersion.edition || 'N/A'}"`);
  }

  if (comparison.dbVersion.standard || comparison.sourceVersion.standard) {
    console.log(`  Standard: DB="${comparison.dbVersion.standard || 'N/A'}" | Source="${comparison.sourceVersion.standard || 'N/A'}"`);
  }

  if (hasIssues) {
    console.log(`  ⚠️  Problèmes:`);
    comparison.issues.forEach(issue => console.log(`      - ${issue}`));
  }

  console.log('');
}

function compareVersions(comparison: VersionComparison) {
  const { dbVersion, sourceVersion, issues } = comparison;

  // Comparer current
  if (sourceVersion.current && dbVersion.current !== sourceVersion.current) {
    // Vérifier si c'est une vraie incohérence (différence de version majeure/mineure)
    if (isSignificantDifference(dbVersion.current, sourceVersion.current)) {
      issues.push(`Current version mismatch: DB="${dbVersion.current}" vs Source="${sourceVersion.current}"`);
    }
  }

  // Comparer LTS
  if (sourceVersion.lts && dbVersion.lts !== sourceVersion.lts) {
    if (isSignificantDifference(dbVersion.lts, sourceVersion.lts)) {
      issues.push(`LTS version mismatch: DB="${dbVersion.lts}" vs Source="${sourceVersion.lts}"`);
    }
  }

  // Vérifier les versions aberrantes
  if (dbVersion.current && dbVersion.lts) {
    // Pour les versions semver, vérifier que current >= lts
    const currentCoerced = semver.coerce(dbVersion.current);
    const ltsCoerced = semver.coerce(dbVersion.lts);

    if (currentCoerced && ltsCoerced) {
      if (semver.lt(currentCoerced, ltsCoerced)) {
        issues.push(`Illogical: current (${dbVersion.current}) < lts (${dbVersion.lts})`);
      }
    }
  }

  // Vérifier si la version current semble incorrecte (trop élevée)
  if (dbVersion.current) {
    const coerced = semver.coerce(dbVersion.current);
    if (coerced && semver.major(coerced) > 100) {
      issues.push(`Suspicious version number: ${dbVersion.current} (major > 100)`);
    }
  }
}

function isSignificantDifference(v1: string | undefined, v2: string | undefined): boolean {
  if (!v1 || !v2) return false;
  if (v1 === v2) return false;

  const c1 = semver.coerce(v1);
  const c2 = semver.coerce(v2);

  if (!c1 || !c2) {
    // Si on ne peut pas parser en semver, considérer toute différence comme significative
    return v1 !== v2;
  }

  // Différence significative si major ou minor diffère
  return semver.major(c1) !== semver.major(c2) || semver.minor(c1) !== semver.minor(c2);
}

async function getSourceVersions(config: any, httpService: HttpService): Promise<any> {
  const versions: any = {};

  const githubHeaders = () => ({
    'User-Agent': 'verstack-bot',
    ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {})
  });

  try {
    switch (config.sourceType) {
      case 'npm': {
        const res = await firstValueFrom(
          httpService.get(`https://registry.npmjs.org/${config.sourceUrl}`)
        );
        const distTags = res.data['dist-tags'] || {};
        versions.current = distTags.latest;

        if (config.ltsSupport) {
          versions.lts = distTags.lts;
        }
        break;
      }

      case 'github': {
        if (config.useTags) {
          // Récupérer les tags
          const res = await firstValueFrom(
            httpService.get(`https://api.github.com/repos/${config.sourceUrl}/tags`, {
              params: { per_page: 100 },
              headers: githubHeaders()
            })
          );

          const tags = res.data.map((t: any) => t.name);

          // Logique spécifique pour C++
          if (config.nameInDb === 'C++') {
            const drafts = tags.filter((t: string) => /^n\d{4}$/.test(t)).sort().reverse();
            if (drafts[0]) versions.standard = drafts[0];
            versions.current = 'C++23';
          } else if (['JavaScript', 'ECMAScript'].includes(config.nameInDb)) {
            const editions = tags
              .filter((t: string) => /^es\d{4}$/i.test(t))
              .map((t: string) => t.toUpperCase())
              .sort((a: string, b: string) => b.localeCompare(a, undefined, { numeric: true }));
            if (editions[0]) versions.edition = editions[0];
          } else {
            // Parser les versions semver
            const semverVersions = tags
              .map((t: string) => semver.coerce(t)?.version)
              .filter((v): v is string => Boolean(v) && !semver.prerelease(v))
              .sort(semver.rcompare);

            if (semverVersions[0]) versions.current = semverVersions[0];
          }
        } else {
          // Récupérer la dernière release
          const res = await firstValueFrom(
            httpService.get(`https://api.github.com/repos/${config.sourceUrl}/releases/latest`, {
              headers: githubHeaders()
            })
          );

          const tagName = res.data?.tag_name;
          if (tagName) {
            const cleaned = tagName.replace(/^v/, '');
            versions.current = cleaned;
          }
        }
        break;
      }

      case 'custom': {
        // Pour les customs, on ne peut pas facilement récupérer sans exécuter les updaters
        // On va juste marquer comme "Custom - skip check"
        versions.current = '(custom - skip)';
        break;
      }
    }
  } catch (error: any) {
    throw new Error(`Failed to fetch: ${error.message}`);
  }

  return versions;
}

// Exécuter le script
checkVersions().catch(error => {
  console.error('❌ Erreur lors de la vérification:', error);
  process.exit(1);
});
