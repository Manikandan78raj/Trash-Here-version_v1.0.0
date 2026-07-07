import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '../redis-cache.service';

describe('RedisCacheService (TDD Unit Suite)', () => {
  let service: RedisCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'REDIS_ENABLED') return false; // Default to memory fallback for tests
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined and initialized in memory fallback mode', () => {
    expect(service).toBeDefined();
    const stats = service.getStats();
    expect(stats.mode).toBe('memory');
    expect(stats.hitCount).toBe(0);
    expect(stats.missCount).toBe(0);
  });

  it('should store and retrieve values with proper hit/miss telemetry', async () => {
    const key = 'th:cache:test:item:1';
    const value = { name: 'Test Waste Item', weight: 15.5 };

    // Initial check should be a miss
    const cachedBefore = await service.get(key);
    expect(cachedBefore).toBeNull();
    expect(service.getStats().missCount).toBe(1);

    // Set value
    await service.set(key, value, 60);

    // Retrieve value should be a hit
    const cachedAfter = await service.get(key);
    expect(cachedAfter).toEqual(value);
    expect(service.getStats().hitCount).toBe(1);
    expect(service.getStats().hitRatio).toBe(0.5); // 1 hit, 1 miss -> 50%
  });

  it('should expire items after TTL seconds', async () => {
    jest.useFakeTimers();
    const key = 'th:cache:test:ttl:1';
    await service.set(key, 'short-lived', 2); // 2 seconds TTL

    expect(await service.get(key)).toBe('short-lived');

    // Advance time by 3 seconds
    jest.advanceTimersByTime(3000);

    expect(await service.get(key)).toBeNull();
    jest.useRealTimers();
  });

  it('should delete keys by exact name', async () => {
    await service.set('key1', 'val1', 60);
    expect(await service.get('key1')).toBe('val1');

    await service.del('key1');
    expect(await service.get('key1')).toBeNull();
  });

  it('should delete multiple keys by wildcard pattern (delByPattern)', async () => {
    await service.set('th:cache:prod:marketing:stats:global', { visits: 100 }, 60);
    await service.set('th:cache:prod:marketing:blog:post-1', { title: 'Post 1' }, 60);
    await service.set('th:cache:prod:wallet:balance:user-1', { balance: 50 }, 60);

    const deletedCount = await service.delByPattern('th:cache:prod:marketing:*');
    expect(deletedCount).toBe(2);

    expect(await service.get('th:cache:prod:marketing:stats:global')).toBeNull();
    expect(await service.get('th:cache:prod:marketing:blog:post-1')).toBeNull();
    expect(await service.get('th:cache:prod:wallet:balance:user-1')).toEqual({ balance: 50 });
  });

  it('should execute fetch-through caching with wrap()', async () => {
    let fetcherCalls = 0;
    const fetcher = jest.fn().mockImplementation(async () => {
      fetcherCalls++;
      return { id: 'item-99', data: 'Fetched Data' };
    });

    const key = 'th:cache:test:wrap:item-99';

    // First call should execute fetcher and cache result
    const result1 = await service.wrap(key, fetcher, 60);
    expect(result1).toEqual({ id: 'item-99', data: 'Fetched Data' });
    expect(fetcherCalls).toBe(1);
    expect(service.getStats().missCount).toBe(1);

    // Second call should return from cache without executing fetcher
    const result2 = await service.wrap(key, fetcher, 60);
    expect(result2).toEqual({ id: 'item-99', data: 'Fetched Data' });
    expect(fetcherCalls).toBe(1); // Still 1!
    expect(service.getStats().hitCount).toBe(1);
    expect(service.getStats().hitRatio).toBe(0.5);
  });
});
