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
        .map((r: any) => ({ version: r.version, lts: r.lts, releaseDate: r.releaseDate }))
        .sort((a: any, b: any) => parseUnityVersion(b.version) - parseUnityVersion(a.version));

      const latestEntry = sortedVersions[0];
      const ltsEntry = sortedVersions.find((r: any) => r.lts);

      if (latestEntry?.version) {
        await setVersion('Unity', 'current', latestEntry.version, latestEntry.releaseDate);
        logger.log(`✅ Unity (custom): current=${latestEntry.version}`);
      }
      if (ltsEntry?.version) {
        await setVersion('Unity', 'lts', ltsEntry.version, ltsEntry.releaseDate);
        logger.log(`✅ Unity (custom): lts=${ltsEntry.version}`);
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

      // Fetch release date from GitHub tag
      let releaseDate: string | undefined = undefined;
      try {
        const tagName = stable.version; // e.g., "go1.25.5"
        const tagRes = await firstValueFrom(
          http.get(`https://api.github.com/repos/golang/go/git/refs/tags/${tagName}`, {
            headers: {
              'User-Agent': 'verstack-bot',
              ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {})
            }
          })
        );

        if (tagRes.data?.object?.url) {
          const commitRes = await firstValueFrom(http.get(tagRes.data.object.url));
          releaseDate = commitRes.data?.committer?.date;
        }
      } catch (err) {
        logger.warn(`⚠️ Go: impossible de récupérer la date depuis GitHub pour ${stable.version}`);
      }

      await setVersion(config.nameInDb, 'current', normalizeLabel(config.nameInDb, latest), releaseDate);
      logger.log(`✅ Go (custom): current=${latest}${releaseDate ? ` (${releaseDate})` : ''}`);
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
    const releaseDate = res.data?.date;
    if (version) {
      await setVersion(config.nameInDb, 'current', version, releaseDate);
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
  },
  PostgreSQL: async (_config, { http, setVersion, logger }) => {
    try {
      // Fetch from PostgreSQL versioning page
      const res = await firstValueFrom(
        http.get('https://www.postgresql.org/support/versioning/', {
          responseType: 'text' as any,
          headers: { 'User-Agent': 'verstack-bot' }
        })
      );

      // Find the current version from the table
      // Pattern: <td>17</td><td>17.7</td> - first pair is major version and current minor
      const versionMatch = res.data.match(/<td>(\d+)<\/td>\s*<td>(\d+\.\d+)<\/td>/);

      if (versionMatch && versionMatch[2]) {
        // Use the full minor version (e.g., 17.7)
        const version = versionMatch[2];
        await setVersion('PostgreSQL', 'current', version);
        logger.log(`✅ PostgreSQL (custom): current=${version}`);
      } else {
        logger.warn(`⚠️ PostgreSQL (custom): impossible de détecter la version`);
      }
    } catch (error) {
      logger.error('❌ Erreur updateCustom [PostgreSQL]:', error);
    }
  },
  css: async (_config, { setVersion, logger }) => {
    try {
      await setVersion('CSS', 'livingStandard', 'Living Standard');
      logger.log('✅ CSS (custom): livingStandard=Living Standard');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [CSS]:', err);
    }
  },
  Nginx: async (_config, { http, setVersion, logger }) => {
    try {
      const res = await firstValueFrom(
        http.get('https://nginx.org/en/download.html', {
          responseType: 'text' as any,
          headers: { 'User-Agent': 'verstack-bot' }
        })
      );

      // Find stable version: "Stable version" section with nginx-X.Y.Z
      const stableMatch = res.data.match(/Stable version[\s\S]*?nginx-(\d+\.\d+\.\d+)/i);

      if (stableMatch && stableMatch[1]) {
        const version = stableMatch[1];
        await setVersion('Nginx', 'current', version);
        logger.log(`✅ Nginx (custom): current=${version}`);
      } else {
        // Fallback: find any nginx version
        const fallbackMatch = res.data.match(/nginx-(\d+\.\d+\.\d+)\.tar\.gz/);
        if (fallbackMatch && fallbackMatch[1]) {
          await setVersion('Nginx', 'current', fallbackMatch[1]);
          logger.log(`✅ Nginx (custom): current=${fallbackMatch[1]}`);
        } else {
          logger.warn(`⚠️ Nginx (custom): impossible de détecter la version`);
        }
      }
    } catch (error) {
      logger.error('❌ Erreur updateCustom [Nginx]:', error);
    }
  },
  // Flutter/Dart packages on pub.dev
  riverpod: async (_config, { http, setVersion, logger }) => {
    try {
      const res = await firstValueFrom(
        http.get('https://pub.dev/api/packages/flutter_riverpod', {
          headers: { 'User-Agent': 'verstack-bot' }
        })
      );
      const version = res.data?.latest?.version;
      const published = res.data?.latest?.published;
      if (version) {
        await setVersion('Riverpod', 'current', version, published);
        logger.log(`✅ Riverpod (pub.dev): current=${version}`);
      } else {
        logger.warn(`⚠️ Riverpod (pub.dev): impossible de détecter la version`);
      }
    } catch (error) {
      logger.error('❌ Erreur updateCustom [Riverpod]:', error);
    }
  },
  bloc: async (_config, { http, setVersion, logger }) => {
    try {
      const res = await firstValueFrom(
        http.get('https://pub.dev/api/packages/flutter_bloc', {
          headers: { 'User-Agent': 'verstack-bot' }
        })
      );
      const version = res.data?.latest?.version;
      const published = res.data?.latest?.published;
      if (version) {
        await setVersion('BLoC', 'current', version, published);
        logger.log(`✅ BLoC (pub.dev): current=${version}`);
      } else {
        logger.warn(`⚠️ BLoC (pub.dev): impossible de détecter la version`);
      }
    } catch (error) {
      logger.error('❌ Erreur updateCustom [BLoC]:', error);
    }
  },
  get: async (_config, { http, setVersion, logger }) => {
    try {
      const res = await firstValueFrom(
        http.get('https://pub.dev/api/packages/get', {
          headers: { 'User-Agent': 'verstack-bot' }
        })
      );
      const version = res.data?.latest?.version;
      const published = res.data?.latest?.published;
      if (version) {
        await setVersion('GetX', 'current', version, published);
        logger.log(`✅ GetX (pub.dev): current=${version}`);
      } else {
        logger.warn(`⚠️ GetX (pub.dev): impossible de détecter la version`);
      }
    } catch (error) {
      logger.error('❌ Erreur updateCustom [GetX]:', error);
    }
  },
  sqlite: async (_config, { http, setVersion, logger }) => {
    try {
      const res = await firstValueFrom(
        http.get('https://www.sqlite.org/download.html', {
          responseType: 'text' as any,
          headers: { 'User-Agent': 'verstack-bot' }
        })
      );
      // Find version like: PRODUCT,3.47.0,3470000
      const match = res.data.match(/PRODUCT,(\d+\.\d+\.\d+),/);
      if (match && match[1]) {
        const version = match[1];
        await setVersion('SQLite', 'current', version);
        logger.log(`✅ SQLite (custom): current=${version}`);
      } else {
        logger.warn(`⚠️ SQLite (custom): impossible de détecter la version`);
      }
    } catch (error) {
      logger.error('❌ Erreur updateCustom [SQLite]:', error);
    }
  },
  // Embedded protocols
  mqtt: async (_config, { setVersion, logger }) => {
    try {
      // MQTT version is a specification version, currently 5.0
      await setVersion('MQTT', 'current', '5.0');
      logger.log('✅ MQTT (custom): current=5.0');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [MQTT]:', err);
    }
  },
  coap: async (_config, { setVersion, logger }) => {
    try {
      // CoAP version is RFC 7252
      await setVersion('CoAP', 'current', 'RFC 7252');
      logger.log('✅ CoAP (custom): current=RFC 7252');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [CoAP]:', err);
    }
  },
  modbus: async (_config, { setVersion, logger }) => {
    try {
      // Modbus version is specification based
      await setVersion('Modbus', 'current', 'V1.1b3');
      logger.log('✅ Modbus (custom): current=V1.1b3');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Modbus]:', err);
    }
  },
  // IA tools
  pinecone: async (_config, { setVersion, logger }) => {
    try {
      // Pinecone is a managed service, version follows their API version
      await setVersion('Pinecone', 'current', '2024.10');
      logger.log('✅ Pinecone (custom): current=2024.10');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Pinecone]:', err);
    }
  },
  coreml: async (_config, { setVersion, logger }) => {
    try {
      // CoreML version follows iOS/macOS SDK releases
      await setVersion('CoreML', 'current', '8.0');
      logger.log('✅ CoreML (custom): current=8.0 (iOS 18/macOS 15)');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [CoreML]:', err);
    }
  },
  tflite: async (_config, { setVersion, logger }) => {
    try {
      // TFLite version follows TensorFlow version - manual update
      await setVersion('TFLite', 'current', '2.18.0');
      logger.log('✅ TFLite (custom): current=2.18.0 (follows TensorFlow)');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [TFLite]:', err);
    }
  },
  // Game tools
  opengl: async (_config, { setVersion, logger }) => {
    try {
      // OpenGL latest version
      await setVersion('OpenGL', 'current', '4.6');
      logger.log('✅ OpenGL (custom): current=4.6');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [OpenGL]:', err);
    }
  },
  vulkan: async (_config, { setVersion, logger }) => {
    try {
      // Vulkan latest version
      await setVersion('Vulkan', 'current', '1.3');
      logger.log('✅ Vulkan (custom): current=1.3');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Vulkan]:', err);
    }
  },
  directx: async (_config, { setVersion, logger }) => {
    try {
      // DirectX 12 latest
      await setVersion('DirectX', 'current', '12');
      logger.log('✅ DirectX (custom): current=12');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [DirectX]:', err);
    }
  },
  metal: async (_config, { setVersion, logger }) => {
    try {
      // Metal version follows iOS/macOS SDK
      await setVersion('Metal', 'current', '3.2');
      logger.log('✅ Metal (custom): current=3.2 (iOS 18/macOS 15)');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Metal]:', err);
    }
  },
  fmod: async (_config, { setVersion, logger }) => {
    try {
      // FMOD Studio latest version
      await setVersion('FMOD', 'current', '2.02');
      logger.log('✅ FMOD (custom): current=2.02');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [FMOD]:', err);
    }
  },
  wwise: async (_config, { setVersion, logger }) => {
    try {
      // Wwise latest version
      await setVersion('Wwise', 'current', '2024.1');
      logger.log('✅ Wwise (custom): current=2024.1');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Wwise]:', err);
    }
  },
  photon: async (_config, { setVersion, logger }) => {
    try {
      // Photon Engine latest
      await setVersion('Photon', 'current', '5.0');
      logger.log('✅ Photon (custom): current=5.0');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Photon]:', err);
    }
  },
  // DevOps tools
  'github-actions': async (_config, { setVersion, logger }) => {
    try {
      // GitHub Actions follows GitHub version/features
      await setVersion('GitHub Actions', 'current', '2024.11');
      logger.log('✅ GitHub Actions (custom): current=2024.11');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [GitHub Actions]:', err);
    }
  },
  'azure-devops': async (_config, { setVersion, logger }) => {
    try {
      // Azure DevOps Server latest version
      await setVersion('Azure DevOps', 'current', '2024');
      logger.log('✅ Azure DevOps (custom): current=2024');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Azure DevOps]:', err);
    }
  },
  datadog: async (_config, { setVersion, logger }) => {
    try {
      // Datadog Agent latest version
      await setVersion('Datadog', 'current', '7.58');
      logger.log('✅ Datadog (custom): current=7.58 (Agent)');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Datadog]:', err);
    }
  },
  snyk: async (_config, { setVersion, logger }) => {
    try {
      // Snyk CLI latest version
      await setVersion('Snyk', 'current', '1.1298.0');
      logger.log('✅ Snyk (custom): current=1.1298.0 (CLI)');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Snyk]:', err);
    }
  },
  // Custom updaters for tools with corrupted external sources
  perl: async (_config, { http, setVersion, logger }) => {
    try {
      // Use perl.org official downloads page
      const res = await firstValueFrom(http.get('https://www.perl.org/get.html', { responseType: 'text' as any }));
      const match = res.data.match(/perl-(\d+\.\d+\.\d+)\.tar/);
      if (match?.[1]) {
        await setVersion('Perl', 'current', match[1]);
        logger.log(`✅ Perl (custom): current=${match[1]}`);
      } else {
        logger.warn('⚠️ Perl (custom): version introuvable sur perl.org');
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Perl]:', err);
    }
  },
  haskell: async (_config, { http, setVersion, logger }) => {
    try {
      // GHC releases are infrequent; use latest stable version
      // GHC doesn't have reliable GitHub releases or stable API
      // This should be updated manually when new major GHC versions are released
      const version = '9.10.1';
      await setVersion('Haskell', 'current', version);
      logger.log(`✅ Haskell (custom): current=${version} (GHC)`);
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Haskell]:', err);
    }
  },
  django: async (_config, { http, setVersion, logger }) => {
    try {
      // Use PyPI instead of GitHub
      const res = await firstValueFrom(http.get('https://pypi.org/pypi/Django/json'));
      const latest = res.data?.info?.version;
      // Get upload time for the latest version
      const releases = res.data?.releases?.[latest];
      const releaseDate = releases?.[0]?.upload_time_iso_8601 || releases?.[0]?.upload_time;
      if (latest) {
        await setVersion('Django', 'current', latest, releaseDate);
        // LTS: Django 4.2.x
        await setVersion('Django', 'lts', '4.2');
        logger.log(`✅ Django (custom via PyPI): current=${latest}, lts=4.2`);
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Django]:', err);
    }
  },
  platformio: async (_config, { http, setVersion, logger }) => {
    try {
      // Use GitHub releases instead of npm (npm has malicious 0.0.1-security)
      const res = await firstValueFrom(http.get('https://api.github.com/repos/platformio/platformio-core/releases/latest', {
        headers: { 'User-Agent': 'verstack-bot', ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}) }
      }));
      const version = res.data?.tag_name?.replace(/^v/, '');
      const releaseDate = res.data?.published_at;
      if (version) {
        await setVersion('PlatformIO', 'current', version, releaseDate);
        logger.log(`✅ PlatformIO (custom via GitHub): current=${version}`);
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [PlatformIO]:', err);
    }
  },
  cpputest: async (_config, { http, setVersion, logger }) => {
    try {
      // CppUTest doesn't have releases, only tags. Filter out "latest-passing-build"
      const res = await firstValueFrom(http.get('https://api.github.com/repos/cpputest/cpputest/tags', {
        params: { per_page: 100 },
        headers: { 'User-Agent': 'verstack-bot', ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}) }
      }));
      const tags = res.data.map((t: any) => t.name).filter((name: string) => name !== 'latest-passing-build');
      // Find first tag that looks like a version (vX.X or X.X)
      const versionTag = tags.find((tag: string) => /^v?\d+\.\d+/.test(tag));
      if (versionTag) {
        const version = versionTag.replace(/^v/, '');
        await setVersion('CppUTest', 'current', version);
        logger.log(`✅ CppUTest (custom via GitHub tags): current=${version}`);
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [CppUTest]:', err);
    }
  },
  seaborn: async (_config, { http, setVersion, logger }) => {
    try {
      // Use PyPI instead of npm (npm has malicious 0.0.1-security)
      const res = await firstValueFrom(http.get('https://pypi.org/pypi/seaborn/json'));
      const latest = res.data?.info?.version;
      const releases = res.data?.releases?.[latest];
      const releaseDate = releases?.[0]?.upload_time_iso_8601 || releases?.[0]?.upload_time;
      if (latest) {
        await setVersion('Seaborn', 'current', latest, releaseDate);
        logger.log(`✅ Seaborn (custom via PyPI): current=${latest}`);
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Seaborn]:', err);
    }
  },
  jupyter: async (_config, { http, setVersion, logger }) => {
    try {
      // Use PyPI jupyter-core package
      const res = await firstValueFrom(http.get('https://pypi.org/pypi/jupyter-core/json'));
      const latest = res.data?.info?.version;
      const releases = res.data?.releases?.[latest];
      const releaseDate = releases?.[0]?.upload_time_iso_8601 || releases?.[0]?.upload_time;
      if (latest) {
        await setVersion('Jupyter', 'current', latest, releaseDate);
        logger.log(`✅ Jupyter (custom via PyPI): current=${latest} (jupyter-core)`);
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Jupyter]:', err);
    }
  },
  // Python packages that were incorrectly using npm
  albumentations: async (_config, { http, setVersion, logger }) => {
    try {
      const res = await firstValueFrom(http.get('https://pypi.org/pypi/albumentations/json'));
      const latest = res.data?.info?.version;
      const releases = res.data?.releases?.[latest];
      const releaseDate = releases?.[0]?.upload_time_iso_8601 || releases?.[0]?.upload_time;
      if (latest) {
        await setVersion('Albumentations', 'current', latest, releaseDate);
        logger.log(`✅ Albumentations (custom via PyPI): current=${latest}`);
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Albumentations]:', err);
    }
  },
  h2o: async (_config, { http, setVersion, logger }) => {
    try {
      // H2O.ai Python package
      const res = await firstValueFrom(http.get('https://pypi.org/pypi/h2o/json'));
      const latest = res.data?.info?.version;
      const releases = res.data?.releases?.[latest];
      const releaseDate = releases?.[0]?.upload_time_iso_8601 || releases?.[0]?.upload_time;
      if (latest) {
        await setVersion('H2O.ai', 'current', latest, releaseDate);
        logger.log(`✅ H2O.ai (custom via PyPI): current=${latest}`);
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [H2O.ai]:', err);
    }
  },
  // Cocos2d-x uses non-standard tag format: cocos2d-x-4.0
  'cocos2d-x': async (_config, { http, setVersion, logger }) => {
    try {
      const res = await firstValueFrom(http.get('https://api.github.com/repos/cocos2d/cocos2d-x/tags', {
        params: { per_page: 100 },
        headers: { 'User-Agent': 'verstack-bot', ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}) }
      }));
      const tags = res.data.map((t: any) => t.name);
      // Filter tags like cocos2d-x-4.0, cocos2d-x-3.17.2
      const versionTags = tags
        .filter((t: string) => /^cocos2d-x-\d+\.\d+/.test(t) && !t.includes('alpha') && !t.includes('beta'))
        .map((t: string) => ({
          tag: t,
          version: t.replace('cocos2d-x-', '')
        }))
        .sort((a: any, b: any) => {
          const va = semver.coerce(a.version);
          const vb = semver.coerce(b.version);
          if (va && vb) return semver.rcompare(va, vb);
          return b.version.localeCompare(a.version);
        });
      if (versionTags.length > 0) {
        const latest = versionTags[0];
        await setVersion('Cocos2d-x', 'current', latest.version);
        logger.log(`✅ Cocos2d-x (custom via GitHub tags): current=${latest.version}`);
      }
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Cocos2d-x]:', err);
    }
  },
  // Unreal Engine - Private repo, use Wikipedia/static version
  'unreal-engine': async (_config, { http, setVersion, logger }) => {
    try {
      // Try to get from Wikipedia API
      const apiUrl = 'https://en.wikipedia.org/w/api.php?action=parse&page=Unreal_Engine&prop=text&format=json';
      const res = await firstValueFrom(http.get(apiUrl, { headers: { 'User-Agent': 'verstack-bot' }, responseType: 'json' as any }));
      const html = res.data?.parse?.text?.['*'] as string | undefined;
      if (html) {
        // Look for version pattern like "5.5" or "5.4.4"
        const match = html.match(/Stable release[^]*?(\d+\.\d+(?:\.\d+)?)/i);
        if (match?.[1]) {
          await setVersion('Unreal Engine', 'current', match[1]);
          logger.log(`✅ Unreal Engine (custom via Wikipedia): current=${match[1]}`);
          return;
        }
      }
      // Fallback to known stable version
      await setVersion('Unreal Engine', 'current', '5.5');
      logger.log('✅ Unreal Engine (custom): current=5.5 (fallback)');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [Unreal Engine]:', err);
    }
  },
  // GameMaker - Proprietary, use Wikipedia
  gamemaker: async (_config, { http, setVersion, logger }) => {
    try {
      const apiUrl = 'https://en.wikipedia.org/w/api.php?action=parse&page=GameMaker&prop=text&format=json';
      const res = await firstValueFrom(http.get(apiUrl, { headers: { 'User-Agent': 'verstack-bot' }, responseType: 'json' as any }));
      const html = res.data?.parse?.text?.['*'] as string | undefined;
      if (html) {
        // Look for version pattern in the infobox
        const match = html.match(/Stable release[^]*?(\d{4}\.\d+(?:\.\d+)?)/i);
        if (match?.[1]) {
          await setVersion('GameMaker', 'current', match[1]);
          logger.log(`✅ GameMaker (custom via Wikipedia): current=${match[1]}`);
          return;
        }
      }
      // Fallback to known version
      await setVersion('GameMaker', 'current', '2024.11');
      logger.log('✅ GameMaker (custom): current=2024.11 (fallback)');
    } catch (err) {
      logger.error('❌ Erreur updateCustom [GameMaker]:', err);
    }
  },
  // CircleCI - SaaS platform, follows date-based versioning
  circleci: async (_config, { setVersion, logger }) => {
    try {
      // CircleCI is a SaaS platform with continuous deployment
      // Use date-based version for the server/self-hosted version
      const currentDate = new Date();
      const version = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      await setVersion('CircleCI', 'current', version);
      logger.log(`✅ CircleCI (custom): current=${version} (SaaS platform)`);
    } catch (err) {
      logger.error('❌ Erreur updateCustom [CircleCI]:', err);
    }
  }
};
