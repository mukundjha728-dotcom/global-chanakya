import { Redis } from '@upstash/redis';

// Determine if we are in a production environment with actual Upstash credentials
const isProd = process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL;

// Initialize actual Upstash Redis if credentials exist
let redisClient: Redis | null = null;
if (isProd) {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  });
}

// In-memory fallback map for development
const localCache = new Map<string, { value: any; expiresAt: number }>();

export const redis = {
  async get<T>(key: string): Promise<T | null> {
    if (redisClient) {
      return redisClient.get<T>(key);
    }
    const cached = localCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      localCache.delete(key);
      return null;
    }
    return cached.value as T;
  },

  async set(key: string, value: any, exOption?: "EX", exSeconds?: number): Promise<void> {
    if (redisClient) {
      if (exOption === "EX" && exSeconds) {
        await redisClient.set(key, value, { ex: exSeconds });
      } else {
        await redisClient.set(key, value);
      }
      return;
    }
    
    // Dev fallback
    const expiresAt = (exOption === "EX" && exSeconds) 
      ? Date.now() + exSeconds * 1000 
      : Date.now() + 1000 * 60 * 60 * 24 * 365; // 1 year default
    
    localCache.set(key, { value, expiresAt });
  },

  async del(key: string): Promise<void> {
    if (redisClient) {
      await redisClient.del(key);
      return;
    }
    localCache.delete(key);
  }
};
