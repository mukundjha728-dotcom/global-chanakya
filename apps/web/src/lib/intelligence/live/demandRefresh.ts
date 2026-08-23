import { redis } from "@/lib/redis";
import { after } from "next/server";

const REFRESH_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const LOCK_KEY = "intelligence:demand-refresh-lock";
const LAST_SUCCESS_KEY = "intelligence:last-successful-ingestion";
const LOCK_TTL_SECONDS = 120; // 2 minutes max lock duration

export async function ensureFreshLiveIntelligence(): Promise<void> {
  const task = async () => {
    try {
      const lastSuccessfulIngestion = await redis.get<number>(LAST_SUCCESS_KEY) || 0;
      
      // Check if data is still fresh
      if (Date.now() - lastSuccessfulIngestion < REFRESH_WINDOW_MS) {
        return;
      }

      // Try to acquire distributed lock
      const lockAcquired = await acquireLock(LOCK_KEY, LOCK_TTL_SECONDS);
      if (!lockAcquired) {
        // Another process is already handling the refresh
        return;
      }

      // Lock acquired, trigger ingestion in the background safely
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      
      console.log("[DemandRefresh] Triggering internal refresh securely...");
      
      await fetch(`${baseUrl}/api/internal/intelligence/refresh`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`
        }
      }).catch(err => console.error("[DemandRefresh] Failed to trigger internal refresh:", err));
      
    } catch (error) {
      console.error("[DemandRefresh] Error in background task:", error);
    }
  };

  // SERVERLESS RUNTIME RISK MITIGATION:
  // We use `after` to guarantee the entire check (Redis) and fetch executes safely 
  // in the background without blocking the public HTTP response by a single millisecond.
  if (typeof after === 'function') {
    after(task);
  } else {
    // Fallback for local scripts/tests where next/server is not fully mocked
    task().catch(() => {});
  }
}

async function acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
  const existing = await redis.get(key);
  if (existing) return false;
  await redis.set(key, "LOCKED", "EX", ttlSeconds);
  return true;
}

// Can be called by the ingestion service upon completion
export async function markIngestionComplete(): Promise<void> {
  await redis.set(LAST_SUCCESS_KEY, Date.now());
  await redis.del(LOCK_KEY);
}
