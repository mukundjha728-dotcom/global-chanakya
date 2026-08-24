import { liveIngestionService } from "./ingestion.service";
import dbConnect from "@/lib/mongoose";
import { redisCache } from "../../cache/redis.cache";

const WORKER_LOCK_KEY = "intelligence:worker:lock";
const WORKER_STATUS_KEY = "intelligence:worker:status";

const POLL_INTERVAL_MS = Number(process.env.INTELLIGENCE_POLL_INTERVAL_MS) || 12 * 60 * 1000;

export function startLiveIntelligenceDaemon() {
  // 1. Process-Level Singleton check to prevent duplicate workers (HMR / multiple initializations)
  if ((globalThis as any).__globalChanakyaIntelligenceWorker) {
    return;
  }
  
  // Do not run during build phase or on Edge runtimes
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  (globalThis as any).__globalChanakyaIntelligenceWorker = true;
  console.log(`[INTELLIGENCE WORKER] Starting autonomous ingestion background daemon (Interval: ${POLL_INTERVAL_MS}ms)`);

  let cycleCounter = 0;

  const runCycle = async () => {
    cycleCounter++;
    const tStart = Date.now();
    let lockAcquired = false;
    let cycleStats: any = null;
    let lastError: string | null = null;

    try {
      // 2. Redis Distributed Lock check
      // Try to acquire lock. NX means set only if it doesn't exist. EX sets expiry in seconds.
      // We set expiration to slightly less than interval to guarantee release, but safely cover the cycle.
      const lockExpirySeconds = Math.max(Math.floor(POLL_INTERVAL_MS / 1000) - 10, 60); 
      
      const acquired = await redisCache.set(WORKER_LOCK_KEY, `worker-${Date.now()}`, lockExpirySeconds, { NX: true });
      
      if (!acquired) {
        // Another worker instance holds the lock.
        console.log(`[INTELLIGENCE WORKER] Another instance is currently holding the ingestion lock. Skipping cycle.`);
        return;
      }
      
      lockAcquired = true;
      
      // Update status to RUNNING
      await updateWorkerStatus("RUNNING", tStart);
      
      console.log(`[INTELLIGENCE WORKER] Cycle ${cycleCounter} started. Lock acquired.`);

      // 3. Ensure DB
      await dbConnect();

      // 4. Run ingestion
      cycleStats = await liveIngestionService.pollAllProviders();

      console.log(`[INTELLIGENCE WORKER] Cycle ${cycleCounter} complete.`);
      console.log(`[INTELLIGENCE WORKER] Providers checked: ${cycleStats.providersHealthy + cycleStats.providersFailed}`);
      console.log(`[INTELLIGENCE WORKER] New events discovered: ${cycleStats.fetched}`);
      console.log(`[INTELLIGENCE WORKER] Deduplicated: ${cycleStats.duplicates}`);
      console.log(`[INTELLIGENCE WORKER] Published: ${cycleStats.inserted}`);
      
      if (cycleStats.inserted === 0 && cycleStats.fetched > 0) {
        console.log(`[INTELLIGENCE WORKER] No new intelligence discovered.`);
      }

    } catch (err: any) {
      console.error(`[INTELLIGENCE WORKER] Error in cycle ${cycleCounter}:`, err.message);
      lastError = err.message || "Unknown Error";
    } finally {
      const tEnd = Date.now();
      const durationMs = tEnd - tStart;
      const nextPollAt = tEnd + POLL_INTERVAL_MS;

      // Ensure lock is released if we acquired it
      if (lockAcquired) {
        try {
          await redisCache.delete(WORKER_LOCK_KEY);
          
          // Write completion status to Redis
          await updateWorkerStatus("WAITING", tStart, tEnd, durationMs, cycleStats, nextPollAt, lastError);
        } catch (e: any) {
          console.error(`[INTELLIGENCE WORKER] Error cleaning up lock/status:`, e.message);
        }
      }

      console.log(`[INTELLIGENCE WORKER] Next cycle in ${Math.round(POLL_INTERVAL_MS / 60000)} minutes.`);
      
      // 5. Recursive setTimeout schedule to PREVENT overlapping runs
      setTimeout(runCycle, POLL_INTERVAL_MS);
    }
  };

  // 6. First run executes immediately (after a 2 second delay just to let the main thread settle)
  setTimeout(runCycle, 2000); 
}

async function updateWorkerStatus(
  status: "RUNNING" | "WAITING" | "ERROR", 
  startedAt: number, 
  lastPollAt?: number, 
  lastCycleDuration?: number,
  stats?: any,
  nextPollAt?: number,
  lastError?: string | null
) {
  try {
    const currentState = (await redisCache.get<any>(WORKER_STATUS_KEY)) || {};
    
    const newState = {
      ...currentState,
      status: lastError ? "ERROR" : status,
      startedAt: currentState.startedAt || new Date(startedAt).toISOString(),
    };

    if (lastPollAt) newState.lastPollAt = new Date(lastPollAt).toISOString();
    if (nextPollAt) newState.nextPollAt = new Date(nextPollAt).toISOString();
    if (lastCycleDuration !== undefined) newState.lastCycleDuration = lastCycleDuration;
    if (lastError) newState.lastError = lastError;
    
    if (stats) {
      newState.eventsDiscovered = stats.fetched;
      newState.eventsDeduplicated = stats.duplicates;
      newState.eventsEnriched = stats.normalized; // Extracted
      newState.eventsPublished = stats.inserted;
      newState.providersChecked = stats.providersHealthy + stats.providersFailed;
      
      if (stats.failed === 0 && !lastError) {
        newState.lastSuccessAt = new Date().toISOString();
      }
    }

    await redisCache.set(WORKER_STATUS_KEY, newState);
  } catch (e) {
    // silently fail status update to protect worker loop
  }
}
