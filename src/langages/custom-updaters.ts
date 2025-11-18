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
  C: async (_config, { http, setVersion, logger, normalizeLabel }) => {
    try {
      // Use the Wikipedia API instead of scraping the HTML page directly.
      // The API returns JSON and is more stable; include a User-Agent in headers.
      const apiUrl = 'https://en.wikipedia.org/w/api.php?action=parse&page=C_(programming_language)&prop=text&format=json';
      const res = await firstValueFrom(http.get(apiUrl, { headers: { 'User-Agent': 'verstack-bot' }, responseType: 'json' as any }));
      const html = res.data?.parse?.text?.['*'] as string | undefined;
      if (!html) {
        logger.warn('⚠️ C (custom): contenu Wikipedia introuvable via API');
        return;
      }

      const { extractCStandardsFromHtml } = await import('./version-parsers');
      const found = extractCStandardsFromHtml(html);

      if (found.length) {
        // Garder uniquement le standard le plus récent (le premier dans le tableau)
        const latestStandard = found[0];
        await setVersion('C', 'standard', latestStandard);
        await setVersion('C', 'current', latestStandard);
        logger.log(`📘 C (custom): standard=${latestStandard}, current=${latestStandard}`);
      } else {
        logger.warn('⚠️ C (custom): aucun standard détecté dans le contenu Wikipedia (API)');
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [C]:', err);
    }
  },
  // Placeholder updaters for sources that have no reliable API implemented yet.
  Delphi: async (_config, { http, setVersion, logger }) => {
    try {
      const apiUrls = [
        'https://en.wikipedia.org/w/api.php?action=parse&page=Delphi_(software)&prop=text&format=json',
        'https://en.wikipedia.org/w/api.php?action=parse&page=Delphi&prop=text&format=json'
      ];
      let foundVersions: string[] = [];
      for (const apiUrl of apiUrls) {
        try {
          const res = await firstValueFrom(http.get(apiUrl, { headers: { 'User-Agent': 'verstack-bot' }, responseType: 'json' as any }));
          const html = res.data?.parse?.text?.['*'] as string | undefined;
          if (!html) continue;
          const matches = Array.from(html.matchAll(/Delphi\s*(?:version|\s)?\s*(\d+(?:\.\d+){0,2})/gi)).map(m => m[1]);
          if (matches.length) foundVersions.push(...matches);
        } catch (err) {
          // ignore and try next
        }
      }
      if (foundVersions.length) {
        // Filtrer les versions avec un numéro majeur raisonnable (< 100)
        // Delphi utilise: 10.4, 11, 12 (pas 2010, 2005 qui sont des années)
        const coerced = foundVersions
          .map(v => semver.coerce(v))
          .filter((v): v is import('semver').SemVer => Boolean(v) && semver.major(v) < 100)
          .map(v => v.version);

        const latest = coerced.sort(semver.rcompare)[0] || foundVersions[0];
        await setVersion('Delphi', 'current', latest);
        logger.log(`✅ Delphi (custom): current=${latest}`);
      } else {
        logger.warn('⚠️ Delphi (custom): aucune version détectée via Wikipedia API');
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Delphi]:', err);
    }
  },
  json: async (_config, { setVersion, logger }) => {
    try {
      await setVersion('JSON', 'livingStandard', 'ECMA-404 / RFC 8259');
      logger.log('✅ JSON (custom): livingStandard=ECMA-404 / RFC 8259');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [JSON]:', err);
    }
  },
  sql: async (_config, { http, setVersion, logger }) => {
    try {
      const apiUrl = 'https://en.wikipedia.org/w/api.php?action=parse&page=SQL&prop=text&format=json';
      const res = await firstValueFrom(http.get(apiUrl, { headers: { 'User-Agent': 'verstack-bot' }, responseType: 'json' as any }));
      const html = res.data?.parse?.text?.['*'] as string | undefined;
      if (!html) {
        logger.warn('⚠️ SQL (custom): contenu Wikipedia introuvable');
        return;
      }
      const match = html.match(/SQL\s*[:\-–]?\s*(?:ISO\s*)?([0-9]{4})/i) || html.match(/SQL\s*:\s*(\d{4})/i);
      if (match && match[1]) {
        const label = `SQL:${match[1]}`;
        await setVersion('SQL', 'standard', label);
        await setVersion('SQL', 'current', label);
        logger.log(`✅ SQL (custom): standard=${label}`);
      } else {
        logger.warn('⚠️ SQL (custom): aucun standard détecté');
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [SQL]:', err);
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
      const official = data.official || [];

      // Unity uses Year.Stream.Patch or just Major.Minor.Patch (Unity 6+)
      // Find the version with the highest major number (year or version number)
      const parseUnityVersion = (v: string) => {
        const match = v.match(/^(\d+)\.(\d+)\.(\d+)/);
        if (!match) return 0;
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        const patch = parseInt(match[3], 10);
        return major * 1000000 + minor * 1000 + patch;
      };

      // Sort by version number descending
      const sortedVersions = official
        .map((r: any) => ({ version: r.version, lts: r.lts }))
        .sort((a: any, b: any) => parseUnityVersion(b.version) - parseUnityVersion(a.version));

      const latest = sortedVersions[0]?.version;
      const ltsVersion = sortedVersions.find((r: any) => r.lts)?.version;

      if (latest) {
        await setVersion('Unity', 'current', latest);
        logger.log(`✅ Unity (custom): current=${latest}`);
      }
      if (ltsVersion) {
        await setVersion('Unity', 'lts', ltsVersion);
        logger.log(`✅ Unity (custom): lts=${ltsVersion}`);
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
      .sort((a: any, b: any) => semver.rcompare(a.version.replace(/^v/, ''), b.version.replace(/^v/, '')))[0];
    const current = all
      .filter((r: any) => !r.lts)
      .sort((a: any, b: any) => semver.rcompare(a.version.replace(/^v/, ''), b.version.replace(/^v/, '')))[0];
    const currentLabel = current ? current.version.replace(/^v/, '') : null;
    const ltsLabel = lts ? lts.version.replace(/^v/, '') : null;
    if (current) await setVersion(config.nameInDb, 'current', currentLabel!, current.date);
    if (lts) await setVersion(config.nameInDb, 'lts', ltsLabel!, lts.date);
    logger.log(`✅ Node.js: current=${currentLabel}, lts=${ltsLabel}`);
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
