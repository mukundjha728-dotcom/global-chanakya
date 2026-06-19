import { memoryCache } from "@/lib/cache/memory.cache";

export class RateLimiter {
  static async checkLimit(ip: string, endpoint: string, limit: number, windowSeconds: number): Promise<boolean> {
    const key = `ratelimit:${endpoint}:${ip}`;
    const current = await memoryCache.get<number>(key) || 0;
    
    if (current >= limit) {
      return false; // Rate limit exceeded
    }

    // Increment and set expiry
    // MemoryCache doesn't natively support atomic increments, but since this is single-instance memory,
    // this basic approach works for our scale. For distributed systems, switch to Redis.
    await memoryCache.set(key, current + 1, windowSeconds);
    return true;
  }
}
