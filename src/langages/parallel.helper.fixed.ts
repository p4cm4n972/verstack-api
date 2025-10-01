import { Logger } from '@nestjs/common';

export interface ParallelOptions {
  concurrency?: number;
  timeout?: number;
}

interface BatchResultSuccess<R> {
  success: true;
  result: R;
}

interface BatchResultError<T> {
  success: false;
  item: T;
  error: Error;
}

type BatchResult<T, R> = BatchResultSuccess<R> | BatchResultError<T>;

export class ParallelHelper {
  private static logger = new Logger(ParallelHelper.name);

  static async processInBatches<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    options: ParallelOptions = {}
  ): Promise<{ results: R[]; errors: { item: T; error: Error }[] }> {
    const { concurrency = 5, timeout = 30000 } = options;

    const results: R[] = [];
    const errors: { item: T; error: Error }[] = [];

    // Traiter par batches
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      this.logger.debug(`🚀 Traitement du batch ${Math.floor(i/concurrency) + 1}/${Math.ceil(items.length/concurrency)} (${batch.length} éléments)`);

      const batchPromises = batch.map(async (item): Promise<BatchResult<T, R>> => {
        try {
          const result = await Promise.race([
            processor(item),
            this.timeoutPromise<R>(timeout, `Timeout pour l'élément ${JSON.stringify(item)}`)
          ]);
          return { success: true, result };
        } catch (error) {
          return { success: false, item, error: error as Error };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        if (result.success) {
          results.push(result.result);
        } else {
          errors.push({ item: result.item, error: result.error });
        }
      }
    }

    return { results, errors };
  }

  static async processWithSettled<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<{ results: R[]; errors: { item: T; error: Error }[] }> {
    const promises = items.map(async (item): Promise<BatchResult<T, R>> => {
      try {
        const result = await processor(item);
        return { success: true, result };
      } catch (error) {
        return { success: false, item, error: error as Error };
      }
    });

    const allResults = await Promise.allSettled(promises);
    const results: R[] = [];
    const errors: { item: T; error: Error }[] = [];

    allResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          results.push(result.value.result);
        } else {
          errors.push({ item: result.value.item, error: result.value.error });
        }
      } else {
        errors.push({ item: items[index], error: new Error(result.reason) });
      }
    });

    return { results, errors };
  }

  private static timeoutPromise<T>(ms: number, message: string): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }
}