export interface CacheableOptions {
  keyPrefix: string;
  ttl?: number; // seconds
}

export interface CacheEvictOptions {
  keyPrefix: string;
  pattern?: boolean; // if true, deletes by wildcard pattern prefix*
}

export function Cacheable(options: CacheableOptions): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const cacheService =
        (this as any).cacheService || (this as any).redisCacheService;
      if (!cacheService || typeof cacheService.wrap !== "function") {
        return originalMethod.apply(this, args);
      }
      const argsHash = args.length ? ":" + JSON.stringify(args) : "";
      const cacheKey = `th:cache:${options.keyPrefix}:${String(propertyKey)}${argsHash}`;
      return cacheService.wrap(
        cacheKey,
        () => originalMethod.apply(this, args),
        options.ttl,
      );
    };
    return descriptor;
  };
}

export function CacheEvict(options: CacheEvictOptions): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      const cacheService =
        (this as any).cacheService || (this as any).redisCacheService;
      if (cacheService) {
        if (options.pattern) {
          if (typeof cacheService.delByPattern === "function") {
            await cacheService.delByPattern(`th:cache:${options.keyPrefix}:*`);
          }
        } else {
          if (typeof cacheService.del === "function") {
            const argsHash = args.length ? ":" + JSON.stringify(args) : "";
            await cacheService.del(
              `th:cache:${options.keyPrefix}:${String(propertyKey)}${argsHash}`,
            );
          }
        }
      }
      return result;
    };
    return descriptor;
  };
}
