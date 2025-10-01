import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as semver from 'semver';

export interface VersionInfo {
  type: 'current' | 'lts' | 'edition' | 'standard' | 'livingStandard';
  label: string;
  releaseDate?: string;
  endSupport?: string;
  supportDuration?: number;
  isActive?: boolean;
}

export class EnhancedVersionStrategy {
  private readonly logger = new Logger(EnhancedVersionStrategy.name);

  constructor(private readonly http: HttpService) {}

  /**
   * Récupération améliorée pour les packages npm avec support LTS multiple
   */
  async getEnhancedNpmVersions(packageName: string): Promise<VersionInfo[]> {
    const res = await firstValueFrom(this.http.get(`https://registry.npmjs.org/${packageName}`));
    const distTags = res.data['dist-tags'] || {};
    const time = res.data.time || {};

    const versions: VersionInfo[] = [];

    // Version current
    if (distTags.latest) {
      versions.push({
        type: 'current',
        label: distTags.latest,
        releaseDate: time[distTags.latest],
        isActive: true
      });
    }

    // Versions LTS multiples avec gestion chronologique
    const ltsVersions = this.extractLtsVersions(distTags, time);
    versions.push(...ltsVersions);

    return versions;
  }

  /**
   * Extraction intelligente des versions LTS avec chronologie
   */
  private extractLtsVersions(distTags: Record<string, string>, time: Record<string, string>): VersionInfo[] {
    const ltsVersions: VersionInfo[] = [];

    // Gestion du tag 'lts' direct
    if (distTags.lts) {
      ltsVersions.push({
        type: 'lts',
        label: distTags.lts,
        releaseDate: time[distTags.lts],
        isActive: true
      });
    }

    // Gestion des tags versionnés (v18-lts, v19-lts, etc.)
    const versionedLtsTags = Object.keys(distTags)
      .filter(k => /^v\d+-lts$/i.test(k))
      .map(tag => ({
        tag,
        version: distTags[tag],
        releaseDate: time[distTags[tag]],
        majorVersion: parseInt(tag.match(/\d+/)?.[0] || '0')
      }))
      .sort((a, b) => {
        // Trier par date de release d'abord, puis par version majeure
        if (a.releaseDate && b.releaseDate) {
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        }
        return b.majorVersion - a.majorVersion;
      });

    // Marquer les versions LTS actives (les 2-3 plus récentes)
    versionedLtsTags.forEach((lts, index) => {
      ltsVersions.push({
        type: 'lts',
        label: lts.version,
        releaseDate: lts.releaseDate,
        isActive: index < 3, // Les 3 versions LTS les plus récentes sont considérées actives
        supportDuration: this.calculateLtsSupportDuration(lts.majorVersion)
      });
    });

    return ltsVersions;
  }

  /**
   * Calcul de la durée de support LTS basée sur la version majeure
   */
  private calculateLtsSupportDuration(majorVersion: number): number {
    // Angular : 18 mois pour les versions LTS
    // Node.js : 30 mois
    // Personnalisable selon le framework
    return 18; // mois par défaut
  }

  /**
   * Validation des versions récupérées
   */
  validateVersions(versions: VersionInfo[]): { valid: VersionInfo[]; issues: string[] } {
    const issues: string[] = [];
    const valid: VersionInfo[] = [];

    const currentVersion = versions.find(v => v.type === 'current');
    const ltsVersions = versions.filter(v => v.type === 'lts');

    // Vérification : la version LTS ne peut pas être plus récente que current
    if (currentVersion && ltsVersions.length > 0) {
      const latestLts = ltsVersions[0];

      if (semver.gt(latestLts.label, currentVersion.label)) {
        issues.push(`Version LTS (${latestLts.label}) plus récente que current (${currentVersion.label})`);
      } else {
        valid.push(...versions);
      }
    } else {
      valid.push(...versions);
    }

    // Vérification des dates de release
    versions.forEach(version => {
      if (version.releaseDate && isNaN(new Date(version.releaseDate).getTime())) {
        issues.push(`Date de release invalide pour ${version.label}: ${version.releaseDate}`);
      }
    });

    return { valid: issues.length === 0 ? valid : versions, issues };
  }

  /**
   * Récupération spécialisée pour Node.js avec détails LTS étendus
   */
  async getNodeJsVersionsEnhanced(): Promise<VersionInfo[]> {
    const res = await firstValueFrom(this.http.get('https://nodejs.org/dist/index.json'));
    const releases = res.data;

    const versions: VersionInfo[] = [];

    // Version current (dernière non-LTS)
    const currentRelease = releases
      .filter((r: any) => !r.lts)
      .sort((a: any, b: any) => semver.rcompare(a.version.replace('v', ''), b.version.replace('v', '')))[0];

    if (currentRelease) {
      versions.push({
        type: 'current',
        label: currentRelease.version.replace(/^v/, ''),
        releaseDate: currentRelease.date,
        isActive: true
      });
    }

    // Versions LTS avec détails de support
    const ltsReleases = releases
      .filter((r: any) => r.lts)
      .sort((a: any, b: any) => semver.rcompare(a.version.replace('v', ''), b.version.replace('v', '')));

    ltsReleases.forEach((release: any, index: number) => {
      const majorVersion = parseInt(release.version.replace('v', '').split('.')[0]);
      const isEven = majorVersion % 2 === 0;

      versions.push({
        type: 'lts',
        label: release.version.replace(/^v/, ''),
        releaseDate: release.date,
        isActive: index < 2, // Les 2 versions LTS les plus récentes
        supportDuration: 30, // 30 mois pour Node.js LTS
        endSupport: this.calculateNodeLtsEndDate(release.date)
      });
    });

    return versions;
  }

  private calculateNodeLtsEndDate(startDate: string): string {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + 30); // 30 mois de support
    return start.toISOString();
  }

  /**
   * Analyse comparative des stratégies de versions
   */
  async analyzeVersionStrategy(packageName: string): Promise<{
    current: VersionInfo[];
    enhanced: VersionInfo[];
    improvements: string[];
  }> {
    const enhanced = await this.getEnhancedNpmVersions(packageName);

    // Simulation de l'ancienne méthode pour comparaison
    const res = await firstValueFrom(this.http.get(`https://registry.npmjs.org/${packageName}`));
    const distTags = res.data['dist-tags'] || {};

    const current: VersionInfo[] = [];
    if (distTags.latest) {
      current.push({ type: 'current', label: distTags.latest });
    }

    // Ancienne logique LTS (simplifiée)
    const ltsKeys = Object.keys(distTags).filter(k => /^v\d+-lts$/.test(k));
    if (ltsKeys.length > 0) {
      const maxKey = ltsKeys.sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).pop();
      if (maxKey) {
        current.push({ type: 'lts', label: distTags[maxKey] });
      }
    }

    const improvements = [
      `Versions LTS multiples détectées: ${enhanced.filter(v => v.type === 'lts').length} vs ${current.filter(v => v.type === 'lts').length}`,
      `Dates de release ajoutées: ${enhanced.filter(v => v.releaseDate).length}/${enhanced.length}`,
      `Statut actif/inactif: ${enhanced.filter(v => v.isActive).length} versions actives`,
      `Durée de support calculée: ${enhanced.filter(v => v.supportDuration).length} versions`
    ];

    return { current, enhanced, improvements };
  }
}