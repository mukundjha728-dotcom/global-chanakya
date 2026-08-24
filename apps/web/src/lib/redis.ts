import { Redis } from '@upstash/redis';

// Use Upstash if credentials exist (in any environment, not just production)
let redisClient: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  });
}

const usingRealRedis = !!redisClient;

// In-memory fallback map for local dev without Upstash
const localCache = new Map<string, { value: any; expiresAt: number }>();

export const redis = {
  isReal: usingRealRedis,

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
    const expiresAt = (exOption === "EX" && exSeconds) 
      ? Date.now() + exSeconds * 1000 
      : Date.now() + 1000 * 60 * 60 * 24 * 365;
    localCache.set(key, { value, expiresAt });
  },

  /**
   * Set-if-not-exists (NX) with expiry. Returns "OK" if acquired, null if already exists.
   * Used for distributed locking.
   */
  async setNX(key: string, value: string, exSeconds: number): Promise<"OK" | null> {
    if (redisClient) {
      const result = await redisClient.set(key, value, { nx: true, ex: exSeconds });
      return result as "OK" | null;
    }
    // In-memory NX simulation
    const existing = localCache.get(key);
    if (existing && Date.now() < existing.expiresAt) return null;
    localCache.set(key, { value, expiresAt: Date.now() + exSeconds * 1000 });
    return "OK";
  },

  /**
   * Delete key only if its value matches (for safe lock release).
   */
  async delIfOwner(key: string, expectedValue: string): Promise<boolean> {
    if (redisClient) {
      // Lua script for atomic check-and-delete
      const script = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("DEL", KEYS[1])
        else
          return 0
        end
      `;
      const result = await redisClient.eval(script, [key], [expectedValue]);
      return result === 1;
    }
    const existing = localCache.get(key);
    if (existing && existing.value === expectedValue) {
      localCache.delete(key);
      return true;
    }
    return false;
  },

  async del(key: string): Promise<void> {
    if (redisClient) {
      await redisClient.del(key);
      return;
    }
    localCache.delete(key);
  }
};
