import { Logger } from '@nestjs/common';
import { LangageSyncConfig } from './langage-sync.config';

export class ConfigValidator {
  private static logger = new Logger(ConfigValidator.name);

  static validateConfigs(configs: LangageSyncConfig[]): {
    valid: LangageSyncConfig[];
    invalid: { config: LangageSyncConfig; errors: string[] }[];
  } {
    const valid: LangageSyncConfig[] = [];
    const invalid: { config: LangageSyncConfig; errors: string[] }[] = [];

    for (const config of configs) {
      const errors = this.validateConfig(config);
      if (errors.length === 0) {
        valid.push(config);
      } else {
        invalid.push({ config, errors });
        this.logger.warn(`⚠️ Configuration invalide pour ${config.nameInDb}: ${errors.join(', ')}`);
      }
    }

    this.logger.log(`✅ Validation terminée: ${valid.length} valides, ${invalid.length} invalides`);
    return { valid, invalid };
  }

  private static validateConfig(config: LangageSyncConfig): string[] {
    const errors: string[] = [];

    // Vérifications de base
    if (!config.nameInDb?.trim()) {
      errors.push('nameInDb est requis');
    }

    if (!config.sourceUrl?.trim()) {
      errors.push('sourceUrl est requis');
    }

    if (!['npm', 'github', 'custom'].includes(config.sourceType)) {
      errors.push('sourceType doit être npm, github ou custom');
    }

    // Vérifications spécifiques par type
    switch (config.sourceType) {
      case 'npm':
        this.validateNpmConfig(config, errors);
        break;
      case 'github':
        this.validateGitHubConfig(config, errors);
        break;
      case 'custom':
        this.validateCustomConfig(config, errors);
        break;
    }

    // Vérifications des options LTS
    if (config.ltsSupport && config.sourceType === 'github' && config.useTags && !config.ltsTagPrefix) {
      errors.push('ltsTagPrefix est requis quand ltsSupport=true et useTags=true pour GitHub');
    }

    return errors;
  }

  private static validateNpmConfig(config: LangageSyncConfig, errors: string[]) {
    // Validation de l'URL NPM
    if (!this.isValidNpmPackageName(config.sourceUrl)) {
      errors.push('sourceUrl doit être un nom de package npm valide');
    }

    // Incompatibilités
    if (config.useTags) {
      errors.push('useTags n\'est pas supporté pour les sources npm');
    }
  }

  private static validateGitHubConfig(config: LangageSyncConfig, errors: string[]) {
    // Validation du format owner/repo
    if (!this.isValidGitHubRepo(config.sourceUrl)) {
      errors.push('sourceUrl doit être au format owner/repo pour GitHub');
    }
  }

  private static validateCustomConfig(config: LangageSyncConfig, errors: string[]) {
    // Pour les custom, soit une URL valide, soit un identifiant connu
    if (config.sourceUrl.startsWith('http')) {
      if (!this.isValidUrl(config.sourceUrl)) {
        errors.push('sourceUrl doit être une URL valide pour les sources custom');
      }
    }
    // Sinon, on assume que c'est un identifiant personnalisé
  }

  private static isValidNpmPackageName(name: string): boolean {
    // Validation basique du nom de package npm
    const npmPackageRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    return npmPackageRegex.test(name);
  }

  private static isValidGitHubRepo(repo: string): boolean {
    // Format owner/repo
    const githubRepoRegex = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
    return githubRepoRegex.test(repo);
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static getDuplicateNameInDb(configs: LangageSyncConfig[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const config of configs) {
      if (seen.has(config.nameInDb)) {
        duplicates.add(config.nameInDb);
      } else {
        seen.add(config.nameInDb);
      }
    }

    return Array.from(duplicates);
  }

  static getConfigStats(configs: LangageSyncConfig[]) {
    const bySourceType = configs.reduce((acc, config) => {
      acc[config.sourceType] = (acc[config.sourceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const withLts = configs.filter(c => c.ltsSupport).length;
    const withEdition = configs.filter(c => c.edition).length;
    const withLivingStandard = configs.filter(c => c.livingStandard).length;
    const withStandardSupport = configs.filter(c => c.standardSupport).length;

    return {
      total: configs.length,
      bySourceType,
      features: {
        ltsSupport: withLts,
        edition: withEdition,
        livingStandard: withLivingStandard,
        standardSupport: withStandardSupport
      }
    };
  }
}