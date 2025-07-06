import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Langage } from '../langages/entities/langage.entity';
import { SYNC_LANGAGES, LangageSyncConfig } from './langage-sync.config';
import * as semver from 'semver';

import { CUSTOM_UPDATERS, CustomUpdaterDeps } from "./custom-updaters";
@Injectable()
/**
 * Service permettant de synchroniser et de mettre à jour les versions des différents langages de programmation
 * dans la base de données à partir de diverses sources (npm, GitHub, pages custom, etc.).
 *
 * Ce service gère la récupération des dernières versions, LTS, éditions ou standards des langages référencés,
 * en normalisant les labels selon le langage, et en mettant à jour les entrées correspondantes en base.
 *
 * Principales fonctionnalités :
 * - Synchronisation de tous les langages configurés via `syncAll()`
 * - Mise à jour depuis npm (`updateFromNpm`)
 * - Mise à jour depuis les tags GitHub (`updateFromGitHubTag`)
 * - Mise à jour depuis les releases GitHub (`updateFromGitHubRelease`)
 * - Mise à jour personnalisée pour certains langages via scraping ou API tierces (`updateCustom`)
 *
 * Utilise Mongoose pour la persistance, HttpService pour les requêtes externes, et gère la journalisation des opérations.
 *
 * @remarks
 * - Les méthodes privées gèrent la normalisation des labels et la construction des headers GitHub.
 * - Les méthodes publiques sont asynchrones et journalisent les succès/échecs.
 * - Le service est conçu pour être utilisé dans un contexte NestJS.
 */
export class LangageUpdateService {
  private readonly logger = new Logger(LangageUpdateService.name);

  constructor(
    @InjectModel(Langage.name) private readonly langageModel: Model<Langage>,
    private readonly http: HttpService
  ) { }

  private normalizeLabel(name: string, label: string): string {
    if (!label) return '';
    switch (name.toLowerCase()) {
      case 'php': {
        const match = label.match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : label.replace(/^php-/, '');
      }
      case 'swift': {
        const match = label.match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : label.replace(/^swift-/, '').replace(/-RELEASE$/, '');
      }
      case 'ruby':
        return label.replace(/_/g, '.');
      case 'c++':
        return label.startsWith('n') ? 'C++23' : label;
      case 'bun':
        return label.replace(/^bun-v/, '');
      case 'erlang':
        return label.replace(/^OTP-/, '');
      case 'ocaml':
        return label.replace(/^ocaml-/, '');
      default:
        return label.trim();
    }
  }

  private githubHeaders(): Record<string, string> {
    return {
      'User-Agent': 'verstack-bot',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {})
    };
  }

  private async setVersion(name: string, type: string, label: string, releaseDate?: string) {
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


  async syncAll(): Promise<{ success: string[]; failed: { name: string; error: string }[] }> {
    const success: string[] = [];
    const failed: { name: string; error: string }[] = [];
    this.logger.log('🚀 Début de la synchronisation des langages...');

    for (const lang of SYNC_LANGAGES) {
      try {
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
        success.push(lang.nameInDb);
      } catch (error) {
        const errorMsg = error?.message || error.toString();
        failed.push({ name: lang.nameInDb, error: errorMsg });
        this.logger.error(`❌ Erreur sur ${lang.nameInDb}`, error);
      }
    }

    this.logger.log(`✅ Terminé : ${success.length} ok / ${failed.length} échecs`);
    if (failed.length > 0) {
      this.logger.warn(`❌ Échecs : ${failed.map(f => f.name).join(', ')}`);
    }

    return { success, failed };
  }

  async updateFromNpm(config: LangageSyncConfig) {
    const res = await firstValueFrom(this.http.get(`https://registry.npmjs.org/${config.sourceUrl}`));
    const distTags = res.data['dist-tags'] || {};
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

  async updateFromGitHubTag(config: LangageSyncConfig) {
    const tags: string[] = [];

    for (let page = 1; page <= 5; page++) {
      const res = await firstValueFrom(this.http.get(`https://api.github.com/repos/${config.sourceUrl}/tags`, {
        params: { per_page: 100, page },
        headers: this.githubHeaders()
      }));
      tags.push(...res.data.map((t: any) => t.name));
      if (res.data.length < 100) break;
    }
    if (config.nameInDb === 'C++' && config.standardSupport) {
      const drafts = tags.filter(t => /^n\d{4}$/.test(t)).sort().reverse();
      const latestDraft = drafts[0];

      // Met à jour le draft comme version "standard"
      if (latestDraft) {
        await this.setVersion(config.nameInDb, 'standard', latestDraft);
        this.logger.log(`📘 ${config.nameInDb} (draft): standard=${latestDraft}`);
      }

      // Fixe manuellement le standard courant (ex: "C++23")
      const currentStandard = 'C++23';
      await this.setVersion(config.nameInDb, 'current', currentStandard);
    }




    if (['JavaScript', 'ECMAScript'].includes(config.nameInDb)) {
      // Rechercher les tags du type "es2024", "es2023", etc.
      const editions = tags
        .filter(t => /^es\d{4}$/i.test(t))
        .map(t => t.toUpperCase()) // ex: "ES2024"
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

      const latestEdition = editions[0];
      if (latestEdition) {
        await this.setVersion(config.nameInDb, 'edition', latestEdition);
        this.logger.log(`✅ ${config.nameInDb} (GitHub tags): edition=${latestEdition}`);
      } else {
        this.logger.warn(`⚠️ Impossible de trouver l'édition ECMAScript pour ${config.nameInDb}`);
      }
      return; // Évite le traitement standard
    }

    // Traitement standard
    const versionRegex = /\d+\.\d+/;
    const versions = tags
      .filter(t => versionRegex.test(t))
      .map(t => semver.coerce(t)?.version)
      .filter((v): v is string => Boolean(v) && !semver.prerelease(v))
      .sort(semver.rcompare);

    const latest = versions[0];
    if (latest) {
      await this.setVersion(config.nameInDb, 'current', this.normalizeLabel(config.nameInDb, latest));
    }

    if (config.ltsSupport && config.ltsTagPrefix) {
      const lts = versions.find(v => v.startsWith(`${config.ltsTagPrefix}.`));
      if (lts) {
        await this.setVersion(config.nameInDb, 'lts', this.normalizeLabel(config.nameInDb, lts));
      }
    }

    const ltsInfo = config.ltsSupport ? `, lts=${config.ltsTagPrefix ?? 'N/A'}` : '';
    this.logger.log(`✅ ${config.nameInDb} (GitHub tags): latest=${latest}${ltsInfo}`);
  }


  async updateFromGitHubRelease(config: LangageSyncConfig) {
    const res = await firstValueFrom(this.http.get(`https://api.github.com/repos/${config.sourceUrl}/releases/latest`, {
      headers: this.githubHeaders()
    }));

    const rawVersion = res.data?.tag_name ?? null;
    const version = rawVersion ? this.normalizeLabel(config.nameInDb, rawVersion) : null;
    const releaseDate = res.data?.published_at ?? null;

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

}
