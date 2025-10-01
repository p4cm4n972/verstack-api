import { Logger } from '@nestjs/common';

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  maxDelay?: number;
}

export class RetryHelper {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
    logger?: Logger,
    operationName?: string
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoffMultiplier = 2,
      maxDelay = 10000
    } = options;

    let currentDelay = delay;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxAttempts) {
          if (logger && operationName) {
            logger.error(`❌ ${operationName} failed after ${maxAttempts} attempts:`, error);
          }
          throw error;
        }

        // Skip retry for specific errors
        if (this.shouldNotRetry(error)) {
          throw error;
        }

        if (logger && operationName) {
          logger.warn(`⚠️ ${operationName} attempt ${attempt}/${maxAttempts} failed, retrying in ${currentDelay}ms...`);
        }

        await this.sleep(currentDelay);
        currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelay);
      }
    }

    throw lastError!;
  }

  private static shouldNotRetry(error: any): boolean {
    // Don't retry on authentication errors or client errors (4xx)
    const status = error?.response?.status;
    return status >= 400 && status < 500;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}