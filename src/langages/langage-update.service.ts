import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Langage } from '../langages/entities/langage.entity';
import { SYNC_LANGAGES, LangageSyncConfig } from './langage-sync.config';
import * as semver from 'semver';

@Injectable()
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
      if (config.nameInDb === 'Ruby') {
        try {
          const res = await firstValueFrom(
            this.http.get('https://www.ruby-lang.org/en/downloads/', {
              responseType: 'text' as any,
            })
          );

          const match = res.data.match(/Stable releases:[^]*?Ruby\s+(\d+\.\d+\.\d+)/i);
          if (match?.[1]) {
            const version = match[1];
            await this.setVersion('Ruby', 'current', version);
            this.logger.log(`✅ Ruby (custom): current=${version}`);
          } else {
            this.logger.warn(`⚠️ Ruby (custom): impossible de détecter la version`);
          }
        } catch (error) {
          this.logger.error(`❌ Erreur updateCustom [Ruby]:`, error);
        }
        return;
      }

      if (config.nameInDb === 'C') {
        const res = await firstValueFrom(this.http.get(
          'https://en.wikipedia.org/wiki/C_(programming_language)',
          { responseType: 'text' as any }
        ));
        const wiki = res.data;

        const found: Array<{ version: string; date?: string }> = [];
        ['C23', 'C17', 'C11', 'C99'].forEach(ver => {
          const regex = new RegExp(`${ver}.*?(?:ISO\\/IEC \\d+:\\d{4})`, 'i');
          if (regex.test(wiki)) found.push({ version: ver });
        });

        if (found.length) {
          for (const std of found) {
            await this.setVersion('C', 'standard', std.version);
          }
          // Définir 'current' sur le premier standard détecté (le plus récent)
          const current = found[0].version;
          await this.setVersion('C', 'current', current);
          this.logger.log(`📘 C (custom): standards=${found.map(f => f.version).join(', ')}, current=${current}`);
        } else {
          this.logger.warn('⚠️ C (custom): aucun standard détecté');
        }
        return;
      }

      if (config.nameInDb === 'MATLAB') {
        const res = await firstValueFrom(this.http.get(
          'https://www.mathworks.com/products/new_products/latest_features.html',
          { responseType: 'text' as any }
        ));

        const match = res.data.match(/R(\d{4}[ab])/i); // ex: R2025a
        if (match?.[1]) {
          const raw = match[1]; // exemple : "2025a"
          const numeric = raw.slice(0, 4) + (raw.endsWith('a') ? '.1' : '.2');
          await this.setVersion('MATLAB', 'current', numeric);
          this.logger.log(`✅ MATLAB (custom): current=${numeric}`);
        } else {
          this.logger.warn(`⚠️ MATLAB (custom): impossible de détecter la version`);
        }
      }

      if (config.nameInDb === 'R') {
        try {
          const res = await firstValueFrom(
            this.http.get('https://api.r-hub.io/rversions/r-release')
          );
          const latest = res.data?.version;
          const date = res.data?.date;
          if (latest) {
            await this.setVersion('R', 'current', latest, date);
            this.logger.log(`✅ R (custom via r-hub): current=${latest}`);
          } else {
            this.logger.warn(`⚠️ R (custom): version introuvable`);
          }
        } catch (err) {
          this.logger.error(`❌ Erreur updateCustom [R]:`, err);
        }
        return;
      }


      if (config.nameInDb === 'Unity') {
        try {
          const res = await firstValueFrom(
            this.http.get('https://public-cdn.cloud.unity3d.com/hub/prod/releases-linux.json')
          );
          const data = res.data;

          const official = data.official;
          const ltsList = data.lts;

          const latest = official?.[0]?.version;
          const lts = ltsList?.[0]?.version;

          if (latest) {
            await this.setVersion('Unity', 'current', latest);
            this.logger.log(`✅ Unity (custom): current=${latest}`);
          }

          if (lts) {
            await this.setVersion('Unity', 'lts', lts);
            this.logger.log(`✅ Unity (custom): lts=${lts}`);
          }

        } catch (err) {
          this.logger.error('❌ Erreur updateCustom [Unity]', err);
        }
        return;
      }










      if (config.sourceUrl === 'nodejs') {
        const res = await firstValueFrom(this.http.get('https://nodejs.org/dist/index.json'));
        const all = res.data;

        const lts = all.filter((r: any) => r.lts)
          .sort((a, b) => semver.rcompare(a.version.replace('v', ''), b.version.replace('v', '')))[0];

        const current = all.filter((r: any) => !r.lts)
          .sort((a, b) => semver.rcompare(a.version.replace('v', ''), b.version.replace('v', '')))[0];

        if (current) await this.setVersion(config.nameInDb, 'current', current.version.replace(/^v/, ''), current.date);
        if (lts) await this.setVersion(config.nameInDb, 'lts', lts.version.replace(/^v/, ''), lts.date);

        this.logger.log(`✅ Node.js: current=${current?.version}, lts=${lts?.version}`);
      }

      if (config.sourceUrl.includes('go.dev')) {
        const res = await firstValueFrom(this.http.get(config.sourceUrl));
        const stable = res.data.find((v: any) => v.stable);

        if (stable?.version) {
          const latest = stable.version.replace(/^go/, '');
          await this.setVersion(config.nameInDb, 'current', this.normalizeLabel(config.nameInDb, latest));
          this.logger.log(`✅ Go (custom): current=${latest}`);
        } else {
          this.logger.warn(`⚠️ Aucune version stable trouvée pour Go`);
        }
      }
      if (config.livingStandard) {
        await this.setVersion(config.nameInDb, 'livingStandard', 'Living Standard');
        this.logger.log(`✅ ${config.nameInDb} (custom): livingStandard`);
      }

      if (config.edition) {
        await this.setVersion(config.nameInDb, 'edition', config.edition);
        this.logger.log(`✅ ${config.nameInDb} (custom): edition=${config.edition}`);
      }

      if (config.nameInDb === 'Java') {
        const info = await firstValueFrom(this.http.get('https://api.adoptium.net/v3/info/available_releases'));
        const available = info.data.available_releases as number[];
        const ltsReleases = new Set(info.data.lts_releases as number[]);
        const currentVersion = Math.max(...available);

        const res = await firstValueFrom(this.http.get(
          `https://api.adoptium.net/v3/assets/feature_releases/${currentVersion}/ga?jvm_impl=hotspot&image_type=jdk&os=linux&page=0&page_size=1&sort_order=DESC`
        ));

        const entry = res.data[0];
        const semver = entry?.version_data?.semver ?? null;
        const releaseDate = entry?.release_date ?? null;

        if (semver) {
          const cleanVersion = semver.split('+')[0]; // remove build metadata
          await this.setVersion(config.nameInDb, 'current', cleanVersion, releaseDate);

          if (ltsReleases.has(currentVersion)) {
            await this.setVersion(config.nameInDb, 'lts', cleanVersion, releaseDate);
          }

          this.logger.log(`✅ Java (custom): current=${cleanVersion}${ltsReleases.has(currentVersion) ? `, lts=${cleanVersion}` : ''}`);
        } else {
          this.logger.warn(`⚠️ Java (custom): aucune version trouvée`);
        }
      }

      if (config.sourceUrl.includes('dart-archive')) {
        const res = await firstValueFrom(this.http.get(config.sourceUrl));
        const version = res.data?.version;

        if (version) {
          await this.setVersion(config.nameInDb, 'current', version);
          this.logger.log(`✅ Dart (custom): current=${version}`);
        } else {
          this.logger.warn(`⚠️ Impossible de récupérer la version de Dart`);
        }

        return;
      }

      if (config.nameInDb === 'MongoDB') {
        const res = await firstValueFrom(this.http.get(config.sourceUrl, { responseType: 'text' as any }));
        const match = res.data.match(/(\d+\.\d+\.\d+)\s+\(current\)/i);
        if (match && match[1]) {
          const version = match[1];
          await this.setVersion(config.nameInDb, 'current', version);
          this.logger.log(`✅ MongoDB (custom): current=${version}`);
        } else {
          this.logger.warn(`⚠️ MongoDB (custom): impossible de trouver la version sur la page`);
        }
        return;
      }













    } catch (error) {
      this.logger.error(`❌ Erreur updateCustom [${config.nameInDb}]:`, error);
      throw error;
    }
  }
}
