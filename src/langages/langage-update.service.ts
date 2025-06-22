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

  private normalizeLabel(name: string, label: string): string {
    if (!label) return '';
    switch (name.toLowerCase()) {
      case 'php': {
        // Extrait le numéro de version (ex: "php-8.4.8" => "8.4.8")
        const match = label.match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : label.replace(/^php-/, '');
      }
      case 'swift': {
        // Extrait le numéro de version (ex: "swift-6.1.2-RELEASE" => "6.1.2")
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
      case 'rust':
      case 'redis':
      case 'laravel':
      case 'bootstrap':
      case 'docker':
      case 'kubernetes':
      case 'ansible':
      case 'v':
        return label.trim();  // passthrough but allows override
      default:
        return label;
    }
  }

  private readonly logger = new Logger(LangageUpdateService.name);

  constructor(
    @InjectModel(Langage.name) private readonly langageModel: Model<Langage>,
    private readonly http: HttpService
  ) {}

  private githubHeaders(): Record<string, string> {
    return {
      'User-Agent': 'verstack-bot',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {})
    };
  }

  private async setVersion(name: string, type: string, label: string, releaseDate?: string) {
    await this.langageModel.updateOne(
      { name },
      {
        $set: {
          'versions.$[v].label': label,
          'versions.$[v].releaseDate': releaseDate || new Date().toISOString()
        }
      },
      { arrayFilters: [{ 'v.type': type }] }
    );
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

    const versionRegex = /\d+\.\d+/;
    const versions = tags
      .filter(t => versionRegex.test(t))
      .map(t => semver.coerce(t)?.version)
      .filter((v): v is string => Boolean(v) && !semver.prerelease(v))
      .sort(semver.rcompare);

    const latest = versions[0];
    if (latest) await this.setVersion(config.nameInDb, 'current', this.normalizeLabel(config.nameInDb, latest));

    if (config.ltsSupport && config.ltsTagPrefix) {
      const lts = versions.find(v => v.startsWith(`${config.ltsTagPrefix}.`));
      if (lts) await this.setVersion(config.nameInDb, 'lts', this.normalizeLabel(config.nameInDb, lts));
    }

    const ltsInfo = config.ltsSupport ? `, lts=${config.ltsTagPrefix ?? 'N/A'}` : '';
    this.logger.log(`✅ ${config.nameInDb} (GitHub tags): latest=${latest}${ltsInfo}`);
  }

  async updateFromGitHubRelease(config: LangageSyncConfig) {
    const res = await firstValueFrom(this.http.get(`https://api.github.com/repos/${config.sourceUrl}/releases/latest`, {
      headers: this.githubHeaders()
    }));

    const version = res.data?.tag_name?.replace(/^v/, '') ?? null;
    const releaseDate = res.data?.published_at ?? null;

    if (version) {
      await this.setVersion(config.nameInDb, 'current', version, releaseDate);
      this.logger.log(`✅ ${config.nameInDb} (GitHub releases) : ${version}`);
    } else {
      this.logger.warn(`⚠️ Aucune version trouvée pour ${config.nameInDb}`);
    }
  }

  async updateCustom(config: LangageSyncConfig) {
  try {
    if (config.sourceUrl === 'nodejs') {
      const res = await firstValueFrom(this.http.get('https://nodejs.org/dist/index.json'));
      const all = res.data;

      const lts = all
        .filter((r: any) => r.lts)
        .sort((a, b) => semver.rcompare(a.version.replace('v', ''), b.version.replace('v', '')))[0];

      const current = all
        .filter((r: any) => !r.lts)
        .sort((a, b) => semver.rcompare(a.version.replace('v', ''), b.version.replace('v', '')))[0];

      if (current) {
        await this.setVersion(config.nameInDb, 'current', current.version.replace(/^v/, ''), current.date);
      }

      if (lts) {
        await this.setVersion(config.nameInDb, 'lts', lts.version.replace(/^v/, ''), lts.date);
      }

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

    // Ajoute ici d'autres cas "custom" si nécessaire

  } catch (error) {
    this.logger.error(`❌ Erreur updateCustom [${config.nameInDb}]:`, error);
    throw error;
  }
}

}
