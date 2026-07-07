import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface CacheTelemetryStats {
  hitCount: number;
  missCount: number;
  hitRatio: number;
  totalKeys: number;
  mode: 'redis' | 'memory';
}

interface MemoryCacheItem {
  value: any;
  expiresAt: number | null; // epoch ms
}

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private redisClient: Redis | null = null;
  private memoryCache = new Map<string, MemoryCacheItem>();
  private mode: 'redis' | 'memory' = 'memory';

  private hitCount = 0;
  private missCount = 0;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const isRedisEnabled =
      this.configService.get<string | boolean>('REDIS_ENABLED') === true ||
      this.configService.get<string>('REDIS_ENABLED') === 'true' ||
      (this.configService.get<string>('REDIS_URL') &&
        this.configService.get<string>('REDIS_ENABLED') !== 'false' &&
        this.configService.get<boolean>('REDIS_ENABLED') !== false);

    if (isRedisEnabled) {
      try {
        const redisUrl =
          this.configService.get<string>('REDIS_URL') ||
          `redis://${this.configService.get<string>('REDIS_HOST') || 'localhost'}:${this.configService.get<number>('REDIS_PORT') || 6379}`;

        this.redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          retryStrategy: (times) => (times > 2 ? null : Math.min(times * 100, 1000)),
          lazyConnect: true,
        });

        await this.redisClient.connect();
        this.mode = 'redis';
        this.logger.log(`[CacheEngine] Connected to Redis Cluster/Sentinel at ${redisUrl}. Mode: REDIS.`);
      } catch (err: any) {
        this.logger.warn(
          `[CacheEngine] Failed to connect to Redis (${err.message}). Seamlessly falling back to in-memory LRU cache.`,
        );
        this.mode = 'memory';
        if (this.redisClient) {
          this.redisClient.disconnect();
          this.redisClient = null;
        }
      }
    } else {
      this.mode = 'memory';
      this.logger.log('[CacheEngine] Initialized in MEMORY fallback mode.');
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.redisClient = null;
    }
    this.memoryCache.clear();
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.mode === 'redis' && this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        if (data !== null && data !== undefined) {
          this.hitCount++;
          return JSON.parse(data) as T;
        }
        this.missCount++;
        return null;
      } catch (err: any) {
        this.logger.error(`[RedisCache] Error reading key "${key}": ${err.message}. Falling back to memory.`);
        return this.getFromMemory<T>(key);
      }
    }
    return this.getFromMemory<T>(key);
  }

  private getFromMemory<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    if (!item) {
      this.missCount++;
      return null;
    }
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      this.missCount++;
      return null;
    }
    this.hitCount++;
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (this.mode === 'redis' && this.redisClient) {
      try {
        const serialized = JSON.stringify(value);
        if (ttlSeconds && ttlSeconds > 0) {
          await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.redisClient.set(key, serialized);
        }
        return;
      } catch (err: any) {
        this.logger.error(`[RedisCache] Error setting key "${key}": ${err.message}. Falling back to memory.`);
        this.setToMemory(key, value, ttlSeconds);
        return;
      }
    }
    this.setToMemory(key, value, ttlSeconds);
  }

  private setToMemory<T>(key: string, value: T, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryCache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    if (this.mode === 'redis' && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err: any) {
        this.logger.error(`[RedisCache] Error deleting key "${key}": ${err.message}`);
      }
    }
    this.memoryCache.delete(key);
  }

  async delByPattern(pattern: string): Promise<number> {
    let deletedCount = 0;
    if (this.mode === 'redis' && this.redisClient) {
      try {
        const stream = this.redisClient.scanStream({ match: pattern, count: 100 });
        const keysToDelete: string[] = [];
        for await (const resultKeys of stream) {
          keysToDelete.push(...resultKeys);
        }
        if (keysToDelete.length > 0) {
          deletedCount = await this.redisClient.del(...keysToDelete);
        }
        return deletedCount;
      } catch (err: any) {
        this.logger.error(`[RedisCache] Error scanning/deleting pattern "${pattern}": ${err.message}`);
      }
    }

    // In-memory pattern matching fallback (convert glob * to regex)
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regexPattern.test(key)) {
        this.memoryCache.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async wrap<T>(key: string, fetcher: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    const freshData = await fetcher();
    await this.set(key, freshData, ttlSeconds);
    return freshData;
  }

  getStats(): CacheTelemetryStats {
    const totalRequests = this.hitCount + this.missCount;
    const hitRatio = totalRequests > 0 ? Number((this.hitCount / totalRequests).toFixed(4)) : 0;
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRatio,
      totalKeys:
        this.mode === 'redis' && this.redisClient ? -1 : this.memoryCache.size, // -1 indicating async redis keyspace
      mode: this.mode,
    };
  }

  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }
}
