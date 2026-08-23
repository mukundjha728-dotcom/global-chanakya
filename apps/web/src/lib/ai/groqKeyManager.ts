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

export class GroqKeyManager {
  private static getConfiguredKeys(): GroqKeyConfig[] {
    const keys: GroqKeyConfig[] = [];
    
    if (process.env.GROQ_API_KEY) {
      keys.push({ id: "groq-1", value: process.env.GROQ_API_KEY });
    }
    if (process.env.GROQ_API_KEY_1) {
      keys.push({ id: "groq-2", value: process.env.GROQ_API_KEY_1 });
    }
    if (process.env.GROQ_API_KEY_2) {
      keys.push({ id: "groq-3", value: process.env.GROQ_API_KEY_2 });
    }
    if (process.env.GROQ_API_KEY_3) {
      keys.push({ id: "groq-4", value: process.env.GROQ_API_KEY_3 });
    }
    if (process.env.GROQ_API_KEY_4) {
      keys.push({ id: "groq-5", value: process.env.GROQ_API_KEY_4 });
    }

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

  static async getAvailableKey(): Promise<GroqKeyConfig | null> {
    const keys = this.getConfiguredKeys();
    if (keys.length === 0) {
      return null;
    }

    const healths = await Promise.all(keys.map(k => this.getKeyHealth(k.id)));
    
    const candidates = keys.map((k, i) => ({
      key: k,
      health: healths[i]
    }));

    let eligible = candidates.filter(c => c.health.status === "HEALTHY");

    if (eligible.length === 0) {
      return null;
    }

    eligible.sort((a, b) => {
      if (a.health.consecutiveFailures !== b.health.consecutiveFailures) {
        return a.health.consecutiveFailures - b.health.consecutiveFailures;
      }
      return a.health.lastSuccessAt - b.health.lastSuccessAt;
    });

    return eligible[0].key;
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
      const expBackoff = DEFAULT_COOLDOWN_MS * Math.pow(2, health.consecutiveFailures);
      cooldownMs = Math.min(expBackoff, 15 * 60 * 1000); 
    }

    health.cooldownUntil = Date.now() + cooldownMs;
    health.consecutiveFailures += 1;
    
    console.warn(`[GroqKeyManager] Key ${keyId} rate limited. Cooldown for ${cooldownMs}ms`);
    await this.saveKeyHealth(keyId, health);
  }

  static async markFailure(keyId: string): Promise<void> {
    const health = await this.getKeyHealth(keyId);
    health.lastFailureAt = Date.now();
    health.consecutiveFailures += 1;
    
    if (health.consecutiveFailures >= 5) {
      health.status = "FAILED";
      console.error(`[GroqKeyManager] Key ${keyId} marked as FAILED due to 5 consecutive failures.`);
    } else {
      health.status = "COOLDOWN";
      health.cooldownUntil = Date.now() + 10000;
    }
    
    await this.saveKeyHealth(keyId, health);
  }

  static async getHealthReport() {
    const keys = this.getConfiguredKeys();
    const healths = await Promise.all(keys.map(k => this.getKeyHealth(k.id)));
    
    let healthy = 0;
    let cooldown = 0;
    let failed = 0;
    let totalRateLimits = 0;
    
    const details = keys.map((k, i) => {
      const h = healths[i];
      if (h.status === "HEALTHY") healthy++;
      else if (h.status === "COOLDOWN") cooldown++;
      else if (h.status === "FAILED") failed++;
      
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

    return {
      totalKeys: keys.length,
      healthy,
      cooldown,
      failed,
      totalRateLimits,
      details
    };
  }
}
