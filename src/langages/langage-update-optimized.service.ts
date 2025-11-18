import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Langage } from '../langages/entities/langage.entity';
import { SYNC_LANGAGES, LangageSyncConfig } from './langage-sync.config';
import { CUSTOM_UPDATERS, CustomUpdaterDeps } from './custom-updaters';
import { RetryHelper, RetryOptions } from './retry.helper';
import { CacheHelper } from './cache.helper';
import { ParallelHelper, ParallelOptions } from './parallel.helper.fixed';
import * as semver from 'semver';
import { extractLatestFromTags, extractCppDraft, extractFallbackVersionFromTags } from './version-parsers';

@Injectable()
export class LangageUpdateOptimizedService {
  private readonly logger = new Logger(LangageUpdateOptimizedService.name);
  private readonly defaultRetryOptions: RetryOptions = {
    maxAttempts: 3,
    delay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000
  };

  constructor(
    @InjectModel(Langage.name) private readonly langageModel: Model<Langage>,
    private readonly http: HttpService
  ) {}

  private normalizeLabel(name: string, label: string): string {
    if (!label) return '';

    let normalized = label;

    // Cas spécifiques d'abord
    switch (name.toLowerCase()) {
      case 'php': {
        const match = label.match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : label.replace(/^php-/, '').replace(/^v/, '');
      }
      case 'swift': {
        const match = label.match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : label.replace(/^swift-/, '').replace(/-RELEASE$/, '').replace(/^v/, '');
      }
      case 'ruby':
        return label.replace(/_/g, '.').replace(/^v/, '');
      case 'c++':
        return label.startsWith('n') ? 'C++23' : label.replace(/^v/, '');
      case 'bun':
        return label.replace(/^bun-v/, '').replace(/^v/, '');
      case 'erlang':
        return label.replace(/^OTP-/, '').replace(/^v/, '');
      case 'ocaml':
        return label.replace(/^ocaml-/, '').replace(/^v/, '');
      case 'docker':
        return label.replace(/^docker-v?/, '').replace(/^v/, '');
      case 'v':
        // V (Vlang) utilise des weekly releases : weekly.2025.46 → 2025.46
        return label.replace(/^weekly\./, '');
    }

    // Règle générique : retirer le préfixe "v" si présent
    if (/^v\d/.test(normalized)) {
      normalized = normalized.substring(1);
    }

    return normalized.trim();
  }

  private githubHeaders(): Record<string, string> {
    return {
      'User-Agent': 'verstack-bot',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {})
    };
  }

  private async setVersion(name: string, type: string, label: string, releaseDate?: string) {
    if (process.env.DRY_RUN === '1') {
      this.logger.log(`(dry-run) ➜ setVersion ${name} ${type}=${label} ${releaseDate ?? ''}`);
      return;
    }
    const langage = await this.langageModel.findOne({ name });

    if (!langage) {
      this.logger.warn(`⚠️ Langage "${name}" introuvable en base`);
      return;
    }

    const existing = langage.versions.find(v => v.type === type);

    if (existing) {
      await this.langageModel.updateOne(
        { name, 'versions.type': type },
        {
          $set: {
            'versions.$.label': label,
            'versions.$.releaseDate': releaseDate || new Date().toISOString()
          }
        }
      );
    } else {
      await this.langageModel.updateOne(
        { name },
        {
          $push: {
            versions: {
              type,
              label,
              releaseDate: releaseDate || new Date().toISOString()
            }
          }
        }
      );
    }
  }

  private async makeHttpRequest(url: string, options: any = {}): Promise<any> {
    const cacheKey = `http:${url}:${JSON.stringify(options)}`;

    // Ensure a default User-Agent is present for sites that require it
    options = { ...(options || {}), headers: { 'User-Agent': 'verstack-bot', ...((options || {}).headers || {}) } };

    return CacheHelper.getOrFetch(
      cacheKey,
      () => RetryHelper.withRetry(
        () => firstValueFrom(this.http.get(url, options)),
        this.defaultRetryOptions,
        this.logger,
        `GET ${url}`
      ),
      5 * 60 * 1000 // 5 minutes de cache
    );
  }

  async syncAll(options: ParallelOptions = {}): Promise<{
    success: string[];
    failed: { name: string; error: string }[];
    stats: { duration: number; totalRequests: number; cacheHits: number }
  }> {
    const startTime = Date.now();
    this.logger.log('🚀 Début de la synchronisation optimisée des langages...');

    const { results, errors } = await ParallelHelper.processInBatches(
      SYNC_LANGAGES,
      async (lang) => {
        switch (lang.sourceType) {
          case 'npm':
            await this.updateFromNpm(lang);
            break;
          case 'github':
            if (lang.useTags) {
              await this.updateFromGitHubTag(lang);
            } else {
              await this.updateFromGitHubRelease(lang);
            }
            break;
          case 'custom':
            await this.updateCustom(lang);
            break;
        }
        return lang.nameInDb;
      },
      { concurrency: options.concurrency || 10, timeout: options.timeout || 30000 }
    );

    const duration = Date.now() - startTime;
    const success = results;
    const failed = errors.map(e => ({ name: e.item.nameInDb, error: e.error.message }));

    this.logger.log(`✅ Synchronisation terminée en ${duration}ms : ${success.length} ok / ${failed.length} échecs`);

    if (failed.length > 0) {
      this.logger.warn(`❌ Échecs : ${failed.map(f => f.name).join(', ')}`);
    }

    const cacheStats = CacheHelper.getStats();

    return {
      success,
      failed,
      stats: {
        duration,
        totalRequests: success.length + failed.length,
        cacheHits: cacheStats.size
      }
    };
  }

  async updateFromNpm(config: LangageSyncConfig) {
    const res = await this.makeHttpRequest(`https://registry.npmjs.org/${config.sourceUrl}`);
    const distTags = (res as any).data['dist-tags'] || {};
    const latest = distTags.latest;
    let lts = distTags.lts as string | undefined;

    if (config.ltsSupport && !lts) {
      const ltsKeys = Object.keys(distTags).filter(k => /^v\d+-lts$/.test(k));
      if (ltsKeys.length > 0) {
        const maxKey = ltsKeys.sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).pop();
        if (maxKey) lts = distTags[maxKey];
      } else if (config.sourceUrl === 'vue') {
        lts = distTags.legacy || distTags['v2-latest'];
      }
    }

    await this.setVersion(config.nameInDb, 'current', this.normalizeLabel(config.nameInDb, latest));
    if (config.ltsSupport && lts) {
      await this.setVersion(config.nameInDb, 'lts', this.normalizeLabel(config.nameInDb, lts));
    }

    if (config.edition) {
      await this.setVersion(config.nameInDb, 'edition', this.normalizeLabel(config.nameInDb, config.edition));
    }

    if (config.livingStandard) {
      await this.setVersion(config.nameInDb, 'livingStandard', 'Living Standard');
    }

    const ltsInfo = config.ltsSupport && lts ? `, lts=${lts}` : config.ltsSupport ? ', lts=N/A' : '';
    this.logger.log(`✅ ${config.nameInDb} (npm): latest=${latest}${ltsInfo}`);
  }

  private filterTagsForLanguage(tags: string[], languageName: string): string[] {
    switch (languageName) {
      case 'Perl':
        // Ne garder que les tags v5.x.x (ignorer les vieux release-* tags)
        return tags.filter(t => /^v5\.\d+\.\d+/.test(t));

      case 'Haskell':
        // Ne garder que les tags ghc-X.Y.Z
        return tags.filter(t => /^ghc-\d+\.\d+\.\d+/.test(t));

      case 'Django':
        // Filtrer les tags Django: garder seulement X.Y ou X.Y.Z avec X < 100
        return tags.filter(t => {
          const match = t.match(/^(\d+)\.(\d+)/);
          if (!match) return false;
          const major = parseInt(match[1], 10);
          return major >= 1 && major < 100;
        });

      case 'C++':
        // Exclure les tags qui commencent par 'n' (drafts) du parsing général
        return tags.filter(t => !/^n\d{4}$/.test(t));

      default:
        return tags;
    }
  }

  async updateFromGitHubTag(config: LangageSyncConfig) {
    const tags: string[] = [];

    // Utiliser la parallélisation pour récupérer plusieurs pages
    const pagePromises = Array.from({ length: 5 }, (_, i) => i + 1).map(page =>
      this.makeHttpRequest(`https://api.github.com/repos/${config.sourceUrl}/tags`, {
        params: { per_page: 100, page },
        headers: this.githubHeaders()
      }).catch(() => ({ data: [] })) // Ignorer les erreurs de pages inexistantes
    );

    const responses = await Promise.all(pagePromises);

    for (const res of responses) {
      const resData = (res as any).data;
      if (resData?.length > 0) {
        tags.push(...resData.map((t: any) => t.name));
      }
      if (resData?.length < 100) break;
    }

    // Filtrer les tags selon le langage (avant tout traitement)
    const filteredTags = this.filterTagsForLanguage(tags, config.nameInDb);

    // Logique spécifique pour C++
    if (config.nameInDb === 'C++' && config.standardSupport) {
      const drafts = tags.filter(t => /^n\d{4}$/.test(t)).sort().reverse();
      const latestDraft = drafts[0];

      if (latestDraft) {
        await this.setVersion(config.nameInDb, 'standard', latestDraft);
        this.logger.log(`📘 ${config.nameInDb} (draft): standard=${latestDraft}`);
      }

      const currentStandard = 'C++23';
      await this.setVersion(config.nameInDb, 'current', currentStandard);
      return;
    }

    // Logique spécifique pour JavaScript/ECMAScript
    if (['JavaScript', 'ECMAScript'].includes(config.nameInDb)) {
      const editions = filteredTags
        .filter(t => /^es\d{4}$/i.test(t))
        .map(t => t.toUpperCase())
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

      const latestEdition = editions[0];
      if (latestEdition) {
        await this.setVersion(config.nameInDb, 'edition', latestEdition);
        this.logger.log(`✅ ${config.nameInDb} (GitHub tags): edition=${latestEdition}`);
      } else {
        this.logger.warn(`⚠️ Impossible de trouver l'édition ECMAScript pour ${config.nameInDb}`);
      }
      return;
    }

    // Traitement standard via helper
    const latest = extractLatestFromTags(filteredTags);
    if (latest) {
      await this.setVersion(config.nameInDb, 'current', this.normalizeLabel(config.nameInDb, latest));
    } else {
      // fallback for non-semver tags (e.g., Flang release_1_0)
      const fallback = extractFallbackVersionFromTags(filteredTags);
      if (fallback) {
        await this.setVersion(config.nameInDb, 'current', this.normalizeLabel(config.nameInDb, fallback));
      }
    }

    // Build versions list for LTS detection
    if (config.ltsSupport && config.ltsTagPrefix) {
      const versions = filteredTags
        .map(t => semver.coerce(t)?.version)
        .filter((v): v is string => Boolean(v) && !semver.prerelease(v))
        .sort(semver.rcompare);
      const lts = versions.find(v => v.startsWith(`${config.ltsTagPrefix}.`));
      if (lts) {
        await this.setVersion(config.nameInDb, 'lts', this.normalizeLabel(config.nameInDb, lts));
      }
    }

    const ltsInfo = config.ltsSupport ? `, lts=${config.ltsTagPrefix ?? 'N/A'}` : '';
    this.logger.log(`✅ ${config.nameInDb} (GitHub tags): latest=${latest ?? 'N/A'}${ltsInfo}`);
  }

  async updateFromGitHubRelease(config: LangageSyncConfig) {
    const res = await this.makeHttpRequest(`https://api.github.com/repos/${config.sourceUrl}/releases/latest`, {
      headers: this.githubHeaders()
    });

    const resData = (res as any).data;
    const rawVersion = resData?.tag_name ?? null;
    const version = rawVersion ? this.normalizeLabel(config.nameInDb, rawVersion) : null;
    const releaseDate = resData?.published_at ?? null;

    if (version) {
      await this.setVersion(config.nameInDb, 'current', version, releaseDate);
      this.logger.log(`✅ ${config.nameInDb} (GitHub releases): current=${version}`);
    } else {
      this.logger.warn(`⚠️ Aucune version trouvée pour ${config.nameInDb}`);
    }

    if (config.edition) {
      await this.setVersion(config.nameInDb, 'edition', this.normalizeLabel(config.nameInDb, config.edition));
    }

    if (config.livingStandard) {
      await this.setVersion(config.nameInDb, 'livingStandard', 'Living Standard');
    }
  }

  async updateCustom(config: LangageSyncConfig) {
    try {
      const deps: CustomUpdaterDeps = {
        http: this.http,
        setVersion: this.setVersion.bind(this),
        logger: this.logger,
        normalizeLabel: this.normalizeLabel.bind(this)
      };

      const updater = CUSTOM_UPDATERS[config.nameInDb] || CUSTOM_UPDATERS[config.sourceUrl];
      if (updater) {
        await updater(config, deps);
        return;
      }

      if (config.livingStandard) {
        await this.setVersion(config.nameInDb, 'livingStandard', 'Living Standard');
        this.logger.log(`✅ ${config.nameInDb} (custom): livingStandard`);
      }

      if (config.edition) {
        await this.setVersion(config.nameInDb, 'edition', config.edition);
        this.logger.log(`✅ ${config.nameInDb} (custom): edition=${config.edition}`);
      }

    } catch (error) {
      this.logger.error(`❌ Erreur updateCustom [${config.nameInDb}]:`, error);
      throw error;
    }
  }

  // Méthodes utilitaires pour la gestion du cache
  async clearCache() {
    CacheHelper.clear();
    this.logger.log('🗑️ Cache vidé');
  }

  async invalidateLanguageCache(languageName: string) {
    CacheHelper.invalidatePattern(`.*${languageName}.*`);
    this.logger.log(`🗑️ Cache invalidé pour ${languageName}`);
  }

  getCacheStats() {
    return CacheHelper.getStats();
  }
}