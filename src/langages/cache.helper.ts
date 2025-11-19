import { Logger } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheHelper {
  private static cache = new Map<string, CacheEntry<any>>();
  private static logger = new Logger(CacheHelper.name);

  // Masquer les données sensibles dans les logs
  private static sanitizeKey(key: string): string {
    return key
      .replace(/Authorization['":\s]+(?:token\s+)?[a-zA-Z0-9_-]+/gi, 'Authorization":"[MASKED]')
      .replace(/ghp_[a-zA-Z0-9]+/g, '[GITHUB_TOKEN]')
      .replace(/password['":\s]+[^'",}]+/gi, 'password":"[MASKED]')
      .replace(/secret['":\s]+[^'",}]+/gi, 'secret":"[MASKED]');
  }

  static async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000 // 5 minutes par défaut
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    const safeKey = this.sanitizeKey(key);

    // Si le cache existe et n'a pas expiré
    if (cached && (now - cached.timestamp) < cached.ttl) {
      this.logger.debug(`📦 Cache hit pour: ${safeKey}`);
      return cached.data;
    }

    // Sinon, fetch les nouvelles données
    this.logger.debug(`🔄 Cache miss, fetching: ${safeKey}`);
    try {
      const data = await fetcher();
      this.cache.set(key, {
        data,
        timestamp: now,
        ttl: ttlMs
      });
      return data;
    } catch (error) {
      // En cas d'erreur, retourner le cache expiré si disponible
      if (cached) {
        this.logger.warn(`⚠️ Erreur lors du fetch, utilisation du cache expiré pour: ${safeKey}`);
        return cached.data;
      }
      throw error;
    }
  }

  static invalidate(key: string): void {
    this.cache.delete(key);
    this.logger.debug(`🗑️ Cache invalidé pour: ${key}`);
  }

  static invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key));
    keysToDelete.forEach(key => this.cache.delete(key));
    this.logger.debug(`🗑️ Cache invalidé pour le pattern: ${pattern} (${keysToDelete.length} entrées)`);
  }

  static clear(): void {
    this.cache.clear();
    this.logger.debug('🗑️ Cache vidé complètement');
  }

  static getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}