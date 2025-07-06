export interface CustomUpdaterDeps {
  http: import('@nestjs/axios').HttpService;
  setVersion: (name: string, type: string, label: string, releaseDate?: string) => Promise<void>;
  logger: import('@nestjs/common').Logger;
  normalizeLabel: (name: string, label: string) => string;
}

import { firstValueFrom } from 'rxjs';
import * as semver from 'semver';
import { LangageSyncConfig } from './langage-sync.config';

export type CustomUpdater = (config: LangageSyncConfig, deps: CustomUpdaterDeps) => Promise<void>;

export const CUSTOM_UPDATERS: Record<string, CustomUpdater> = {
  Ruby: async (_config, { http, setVersion, logger }) => {
    try {
      const res = await firstValueFrom(
        http.get('https://www.ruby-lang.org/en/downloads/', { responseType: 'text' as any })
      );
      const match = res.data.match(/Stable releases:[^]*?Ruby\s+(\d+\.\d+\.\d+)/i);
      if (match?.[1]) {
        await setVersion('Ruby', 'current', match[1]);
        logger.log(`✅ Ruby (custom): current=${match[1]}`);
      } else {
        logger.warn(`⚠️ Ruby (custom): impossible de détecter la version`);
      }
    } catch (error) {
      logger.error('❌ Erreur updateCustom [Ruby]:', error);
    }
  },
  C: async (_config, { http, setVersion, logger }) => {
    const res = await firstValueFrom(
      http.get('https://en.wikipedia.org/wiki/C_(programming_language)', { responseType: 'text' as any })
    );
    const wiki = res.data as string;
    const found: Array<{ version: string }> = [];
    ['C23', 'C17', 'C11', 'C99'].forEach(ver => {
      const regex = new RegExp(`${ver}.*?(?:ISO/IEC \\d+:\\d{4})`, 'i');
      if (regex.test(wiki)) found.push({ version: ver });
    });
    if (found.length) {
      for (const std of found) {
        await setVersion('C', 'standard', std.version);
      }
      const current = found[0].version;
      await setVersion('C', 'current', current);
      logger.log(`📘 C (custom): standards=${found.map(f => f.version).join(', ')}, current=${current}`);
    } else {
      logger.warn('⚠️ C (custom): aucun standard détecté');
    }
  },
  MATLAB: async (_config, { http, setVersion, logger }) => {
    const res = await firstValueFrom(
      http.get('https://www.mathworks.com/products/new_products/latest_features.html', { responseType: 'text' as any })
    );
    const match = res.data.match(/R(\d{4}[ab])/i);
    if (match?.[1]) {
      const raw = match[1];
      const numeric = raw.slice(0, 4) + (raw.endsWith('a') ? '.1' : '.2');
      await setVersion('MATLAB', 'current', numeric);
      logger.log(`✅ MATLAB (custom): current=${numeric}`);
    } else {
      logger.warn(`⚠️ MATLAB (custom): impossible de détecter la version`);
    }
  },
  R: async (_config, { http, setVersion, logger }) => {
    try {
      const res = await firstValueFrom(http.get('https://api.r-hub.io/rversions/r-release'));
      const latest = res.data?.version;
      const date = res.data?.date;
      if (latest) {
        await setVersion('R', 'current', latest, date);
        logger.log(`✅ R (custom via r-hub): current=${latest}`);
      } else {
        logger.warn(`⚠️ R (custom): version introuvable`);
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [R]:', err);
    }
  },
  Unity: async (_config, { http, setVersion, logger }) => {
    try {
      const res = await firstValueFrom(http.get('https://public-cdn.cloud.unity3d.com/hub/prod/releases-linux.json'));
      const data = res.data;
      const official = data.official;
      const ltsList = data.lts;
      const latest = official?.[0]?.version;
      const lts = ltsList?.[0]?.version;
      if (latest) {
        await setVersion('Unity', 'current', latest);
        logger.log(`✅ Unity (custom): current=${latest}`);
      }
      if (lts) {
        await setVersion('Unity', 'lts', lts);
        logger.log(`✅ Unity (custom): lts=${lts}`);
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Unity]', err);
    }
  },
  'Node.js': async (config, { http, setVersion, logger }) => {
    const res = await firstValueFrom(http.get('https://nodejs.org/dist/index.json'));
    const all = res.data;
    const lts = all
      .filter((r: any) => r.lts)
      .sort((a: any, b: any) => semver.rcompare(a.version.replace('v', ''), b.version.replace('v', '')))[0];
    const current = all
      .filter((r: any) => !r.lts)
      .sort((a: any, b: any) => semver.rcompare(a.version.replace('v', ''), b.version.replace('v', '')))[0];
    if (current) await setVersion(config.nameInDb, 'current', current.version.replace(/^v/, ''), current.date);
    if (lts) await setVersion(config.nameInDb, 'lts', lts.version.replace(/^v/, ''), lts.date);
    logger.log(`✅ Node.js: current=${current?.version}, lts=${lts?.version}`);
  },
  nodejs: async (config, deps) => CUSTOM_UPDATERS["Node.js"](config, deps),
  Go: async (config, { http, setVersion, logger, normalizeLabel }) => {
    const res = await firstValueFrom(http.get(config.sourceUrl));
    const stable = res.data.find((v: any) => v.stable);
    if (stable?.version) {
      const latest = stable.version.replace(/^go/, '');
      await setVersion(config.nameInDb, 'current', normalizeLabel(config.nameInDb, latest));
      logger.log(`✅ Go (custom): current=${latest}`);
    } else {
      logger.warn(`⚠️ Aucune version stable trouvée pour Go`);
    }
  },
  Java: async (config, { http, setVersion, logger }) => {
    const info = await firstValueFrom(http.get('https://api.adoptium.net/v3/info/available_releases'));
    const available = info.data.available_releases as number[];
    const ltsReleases = new Set(info.data.lts_releases as number[]);
    const currentVersion = Math.max(...available);
    const res = await firstValueFrom(
      http.get(
        `https://api.adoptium.net/v3/assets/feature_releases/${currentVersion}/ga?jvm_impl=hotspot&image_type=jdk&os=linux&page=0&page_size=1&sort_order=DESC`
      )
    );
    const entry = res.data[0];
    const sem = entry?.version_data?.semver ?? null;
    const releaseDate = entry?.release_date ?? null;
    if (sem) {
      const cleanVersion = sem.split('+')[0];
      await setVersion(config.nameInDb, 'current', cleanVersion, releaseDate);
      if (ltsReleases.has(currentVersion)) {
        await setVersion(config.nameInDb, 'lts', cleanVersion, releaseDate);
      }
      logger.log(`✅ Java (custom): current=${cleanVersion}${ltsReleases.has(currentVersion) ? `, lts=${cleanVersion}` : ''}`);
    } else {
      logger.warn(`⚠️ Java (custom): aucune version trouvée`);
    }
  },
  Dart: async (config, { http, setVersion, logger }) => {
    const res = await firstValueFrom(http.get(config.sourceUrl));
    const version = res.data?.version;
    if (version) {
      await setVersion(config.nameInDb, 'current', version);
      logger.log(`✅ Dart (custom): current=${version}`);
    } else {
      logger.warn(`⚠️ Impossible de récupérer la version de Dart`);
    }
  },
  MongoDB: async (config, { http, setVersion, logger }) => {
    const res = await firstValueFrom(http.get(config.sourceUrl, { responseType: 'text' as any }));
    const match = res.data.match(/(\d+\.\d+\.\d+)\s+\(current\)/i);
    if (match && match[1]) {
      const version = match[1];
      await setVersion(config.nameInDb, 'current', version);
      logger.log(`✅ MongoDB (custom): current=${version}`);
    } else {
      logger.warn(`⚠️ MongoDB (custom): impossible de trouver la version sur la page`);
    }
  }
};
