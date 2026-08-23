import { ICacheService } from "./cache.interface";
// import { Redis } from "@upstash/redis";

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });

// Basic in-memory fallback cache
interface CacheEntry {
  value: any;
  expiry: number;
}
const memoryCache = new Map<string, CacheEntry>();

export class RedisCache implements ICacheService {
  async get<T>(key: string): Promise<T | null> {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    const expiry = Date.now() + (ttlSeconds * 1000);
    memoryCache.set(key, { value, expiry });
    
    // Simple unbounded memory protection: clear if it gets too large
    if (memoryCache.size > 1000) {
      const keys = Array.from(memoryCache.keys());
      for (let i = 0; i < 200; i++) {
        memoryCache.delete(keys[i]);
      }
    }
  }

  async delete(key: string): Promise<void> {
    memoryCache.delete(key);
  }
}

export const redisCache = new RedisCache();
