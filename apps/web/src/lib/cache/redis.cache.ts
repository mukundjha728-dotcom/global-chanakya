import { ICacheService } from "./cache.interface";
// import { Redis } from "@upstash/redis";

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });

export class RedisCache implements ICacheService {
  async get<T>(key: string): Promise<T | null> {
    // return redis.get<T>(key);
    return null; // Disabled until Upstash is configured
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    // await redis.setex(key, ttlSeconds, value);
  }

  async delete(key: string): Promise<void> {
    // await redis.del(key);
  }
}

export const redisCache = new RedisCache();
