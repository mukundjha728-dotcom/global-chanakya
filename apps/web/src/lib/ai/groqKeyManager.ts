import { redis } from "@/lib/redis";

export interface GroqKeyHealth {
  status: "HEALTHY" | "COOLDOWN" | "FAILED";
  consecutiveFailures: number;
  rateLimitCount: number;
  cooldownUntil: number;
  lastSuccessAt: number;
  lastFailureAt: number;
}

export interface GroqKeyConfig {
  id: string;
  value: string;
}

const DEFAULT_COOLDOWN_MS = 60000; // 1 minute
const RR_COUNTER_KEY = "groq:key-rr-index"; // Redis key tracking round-robin position

export class GroqKeyManager {
  private static getConfiguredKeys(): GroqKeyConfig[] {
    const keys: GroqKeyConfig[] = [];

    // Supports up to 5 keys: GROQ_API_KEY, GROQ_API_KEY_1 … GROQ_API_KEY_4
    // Set all 5 in your .env.local / Vercel environment variables.
    if (process.env.GROQ_API_KEY)   keys.push({ id: "groq-1", value: process.env.GROQ_API_KEY });
    if (process.env.GROQ_API_KEY_1) keys.push({ id: "groq-2", value: process.env.GROQ_API_KEY_1 });
    if (process.env.GROQ_API_KEY_2) keys.push({ id: "groq-3", value: process.env.GROQ_API_KEY_2 });
    if (process.env.GROQ_API_KEY_3) keys.push({ id: "groq-4", value: process.env.GROQ_API_KEY_3 });
    if (process.env.GROQ_API_KEY_4) keys.push({ id: "groq-5", value: process.env.GROQ_API_KEY_4 });

    return keys;
  }

  private static async getKeyHealth(keyId: string): Promise<GroqKeyHealth> {
    const defaultHealth: GroqKeyHealth = {
      status: "HEALTHY",
      consecutiveFailures: 0,
      rateLimitCount: 0,
      cooldownUntil: 0,
      lastSuccessAt: 0,
      lastFailureAt: 0
    };

    try {
      const data = await redis.get<GroqKeyHealth>(`groq:key-health:${keyId}`);
      if (data) {
        // Auto-recover from COOLDOWN once the cooldown window has passed
        if (data.status === "COOLDOWN" && Date.now() > data.cooldownUntil) {
          data.status = "HEALTHY";
          data.consecutiveFailures = 0;
          await this.saveKeyHealth(keyId, data);
        }
        return data;
      }
    } catch (e) {
      console.warn(`[GroqKeyManager] Failed to read health for ${keyId}`, e);
    }
    return defaultHealth;
  }

  private static async saveKeyHealth(keyId: string, health: GroqKeyHealth): Promise<void> {
    try {
      await redis.set(`groq:key-health:${keyId}`, health, "EX", 86400);
    } catch (e) {
      console.warn(`[GroqKeyManager] Failed to save health for ${keyId}`, e);
    }
  }

  /**
   * Round-robin key selection.
   *
   * Maintains a Redis counter that advances by 1 on every call so the load
   * is distributed evenly across all configured keys from the very first request.
   * If the next key in the rotation is in COOLDOWN or FAILED, the selector walks
   * forward through the ring until it finds a HEALTHY key.
   * Returns null only when every key is unavailable.
   */
  static async getAvailableKey(): Promise<GroqKeyConfig | null> {
    const keys = this.getConfiguredKeys();
    if (keys.length === 0) return null;

    // Fetch health for all keys in parallel
    const healths = await Promise.all(keys.map(k => this.getKeyHealth(k.id)));

    // Fast path: if all keys are unhealthy, return null immediately
    const anyHealthy = healths.some(h => h.status === "HEALTHY");
    if (!anyHealthy) return null;

    // Read and advance the round-robin counter atomically
    let rrIndex = 0;
    try {
      // INCR returns the value AFTER incrementing — gives us the next position
      const newIndex = await redis.incr(RR_COUNTER_KEY);
      // Set a TTL so the counter doesn't linger forever after a deploy
      await redis.expire(RR_COUNTER_KEY, 86400);
      rrIndex = newIndex % keys.length;
    } catch (e) {
      // Redis unavailable — fall back to index 0
      console.warn("[GroqKeyManager] Could not read RR counter, defaulting to index 0");
      rrIndex = 0;
    }

    // Walk the ring starting at rrIndex, find first HEALTHY key
    for (let i = 0; i < keys.length; i++) {
      const idx = (rrIndex + i) % keys.length;
      if (healths[idx].status === "HEALTHY") {
        return keys[idx];
      }
    }

    return null; // All keys unavailable (should not reach here due to fast-path above)
  }

  static async markSuccess(keyId: string): Promise<void> {
    const health = await this.getKeyHealth(keyId);
    health.status = "HEALTHY";
    health.consecutiveFailures = 0;
    health.lastSuccessAt = Date.now();
    await this.saveKeyHealth(keyId, health);
  }

  static async markRateLimited(keyId: string, retryAfterMs?: number): Promise<void> {
    const health = await this.getKeyHealth(keyId);
    health.status = "COOLDOWN";
    health.rateLimitCount += 1;
    health.lastFailureAt = Date.now();

    let cooldownMs = retryAfterMs;
    if (!cooldownMs) {
      // Exponential backoff capped at 15 minutes
      const expBackoff = DEFAULT_COOLDOWN_MS * Math.pow(2, health.consecutiveFailures);
      cooldownMs = Math.min(expBackoff, 15 * 60 * 1000);
    }

    health.cooldownUntil = Date.now() + cooldownMs;
    health.consecutiveFailures += 1;

    console.warn(
      `[GroqKeyManager] Key ${keyId} rate-limited. ` +
      `Cooldown for ${Math.round(cooldownMs / 1000)}s ` +
      `(rateLimitCount=${health.rateLimitCount})`
    );
    await this.saveKeyHealth(keyId, health);
  }

  static async markFailure(keyId: string): Promise<void> {
    const health = await this.getKeyHealth(keyId);
    health.lastFailureAt = Date.now();
    health.consecutiveFailures += 1;

    if (health.consecutiveFailures >= 5) {
      health.status = "FAILED";
      console.error(`[GroqKeyManager] Key ${keyId} marked FAILED (5 consecutive failures).`);
    } else {
      health.status = "COOLDOWN";
      health.cooldownUntil = Date.now() + 10000; // 10 s short cooldown
    }

    await this.saveKeyHealth(keyId, health);
  }

  static async getHealthReport() {
    const keys = this.getConfiguredKeys();
    const healths = await Promise.all(keys.map(k => this.getKeyHealth(k.id)));

    let healthy = 0, cooldown = 0, failed = 0, totalRateLimits = 0;

    const details = keys.map((k, i) => {
      const h = healths[i];
      if (h.status === "HEALTHY")  healthy++;
      else if (h.status === "COOLDOWN") cooldown++;
      else if (h.status === "FAILED")   failed++;
      totalRateLimits += h.rateLimitCount;

      return {
        id: k.id,
        status: h.status,
        consecutiveFailures: h.consecutiveFailures,
        rateLimitCount: h.rateLimitCount,
        lastSuccessAt: h.lastSuccessAt,
        cooldownUntil: h.cooldownUntil
      };
    });

    return { totalKeys: keys.length, healthy, cooldown, failed, totalRateLimits, details };
  }

  /** Reset all key health state (useful after replacing API keys). */
  static async resetAllHealth(): Promise<void> {
    const keys = this.getConfiguredKeys();
    await Promise.all([
      ...keys.map(k => redis.del(`groq:key-health:${k.id}`)),
      redis.del(RR_COUNTER_KEY)
    ]);
    console.log("[GroqKeyManager] All key health state reset.");
  }
}
