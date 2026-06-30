import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
    analytics: true,
  });
}

// In-memory rate limiter fallback (Temporary)
export class MemoryRateLimiter {
  private static store = new Map<string, { count: number; expiresAt: number }>();

  static async checkLimit(ip: string, action: string, limit: number, windowMs: number) {
    const key = `${ip}:${action}`;
    const now = Date.now();
    const record = this.store.get(key);

    // Clean up old records periodically
    if (this.store.size > 10000) {
      for (const [k, v] of this.store.entries()) {
        if (v.expiresAt < now) this.store.delete(k);
      }
    }

    if (!record || record.expiresAt < now) {
      this.store.set(key, { count: 1, expiresAt: now + windowMs });
      return { success: true };
    }

    if (record.count >= limit) {
      return { success: false }; // Rate limited
    }

    record.count += 1;
    this.store.set(key, record);
    return { success: true };
  }
}

export { ratelimit };
