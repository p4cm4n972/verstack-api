import { Logger } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheHelper {
  private static cache = new Map<string, CacheEntry<any>>();
  private static logger = new Logger(CacheHelper.name);

  static async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000 // 5 minutes par défaut
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Si le cache existe et n'a pas expiré
    if (cached && (now - cached.timestamp) < cached.ttl) {
      this.logger.debug(`📦 Cache hit pour: ${key}`);
      return cached.data;
    }

    // Sinon, fetch les nouvelles données
    this.logger.debug(`🔄 Cache miss, fetching: ${key}`);
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
        this.logger.warn(`⚠️ Erreur lors du fetch, utilisation du cache expiré pour: ${key}`);
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