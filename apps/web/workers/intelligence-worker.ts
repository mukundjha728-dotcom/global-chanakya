/**
 * Global Chanakya — Autonomous Intelligence Worker
 * ================================================
 * Standalone persistent Node.js process.
 * Runs independently of the Vercel website.
 * Deploy on Railway / Render / VPS.
 *
 * Architecture:
 *   Worker (Railway/persistent Node) → polls RSS → MongoDB
 *   Website (Vercel)                 → reads MongoDB
 *
 * Usage:
 *   npx tsx workers/intelligence-worker.ts
 *   OR via package.json script: pnpm worker:intelligence
 */

import { config } from "dotenv";
config({ path: ".env.local" });

// These imports must come AFTER dotenv config
import dbConnect from "@/lib/mongoose";
import { redis } from "@/lib/redis";
import { liveIngestionService } from "@/lib/intelligence/live/ingestion.service";
import { IntelligenceEvent } from "@/lib/models/IntelligenceEvent";
import { randomUUID } from "crypto";

// ─── Configuration ────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = Number(process.env.INTELLIGENCE_POLL_INTERVAL_MS) || 12 * 60 * 1000; // 12 minutes
const WORKER_LOCK_KEY = "intelligence:worker:lock";
const WORKER_STATUS_KEY = "intelligence:worker:status";
const LOCK_TTL_SECONDS = Math.max(Math.floor(POLL_INTERVAL_MS / 1000) - 30, 120); // lock expires just before next cycle
const WORKER_ID = `worker-${randomUUID().substring(0, 8)}`; // unique instance identifier

// ─── Global state ─────────────────────────────────────────────────────────────
let cycleCount = 0;
let isFirstCycle = true;

// ─── Startup Banner ───────────────────────────────────────────────────────────
function printBanner() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log(`║   GLOBAL CHANAKYA — INTELLIGENCE WORKER              ║`);
  console.log(`║   ID: ${WORKER_ID.padEnd(46)}║`);
  console.log(`║   Interval: ${String(POLL_INTERVAL_MS / 60000 + " min").padEnd(42)}║`);
  console.log(`║   Real Redis: ${String(redis.isReal).padEnd(40)}║`);
  console.log("╚══════════════════════════════════════════════════════╝\n");
}

// ─── Redis Worker Status ──────────────────────────────────────────────────────
async function updateStatus(fields: Record<string, any>) {
  try {
    const current = (await redis.get<any>(WORKER_STATUS_KEY)) || {};
    const updated = { ...current, ...fields };
    await redis.set(WORKER_STATUS_KEY, updated, "EX", POLL_INTERVAL_MS / 1000 * 3 + 3600);
  } catch (e) {
    // Never let status update crash the cycle
  }
}

// ─── Database Pre-Audit ───────────────────────────────────────────────────────
async function printDbStats(label: string) {
  const [total, published, draft, archived, completed, failed] = await Promise.all([
    IntelligenceEvent.countDocuments({}),
    IntelligenceEvent.countDocuments({ status: "published" }),
    IntelligenceEvent.countDocuments({ status: "draft" }),
    IntelligenceEvent.countDocuments({ status: "archived" }),
    IntelligenceEvent.countDocuments({ enrichmentStatus: "COMPLETED" }),
    IntelligenceEvent.countDocuments({ enrichmentStatus: "FAILED" }),
  ]);
  console.log(`[DB ${label}] Total=${total} | Published=${published} | Draft=${draft} | Archived=${archived} | COMPLETED=${completed} | FAILED=${failed}`);
  return { total, published, draft, archived, completed, failed };
}

// ─── Main Cycle ───────────────────────────────────────────────────────────────
async function runCycle(): Promise<void> {
  cycleCount++;
  const tStart = Date.now();
  let lockAcquired = false;
  let lastError: string | null = null;
  let cycleStats: any = null;

  console.log(`\n${"─".repeat(54)}`);
  console.log(`[WORKER] Cycle ${cycleCount} starting | ${new Date().toISOString()}`);

  try {
    // ── 1. Acquire distributed lock ──────────────────────────────
    const acquired = await redis.setNX(WORKER_LOCK_KEY, WORKER_ID, LOCK_TTL_SECONDS);
    if (!acquired) {
      const lockOwner = await redis.get<string>(WORKER_LOCK_KEY);
      console.log(`[WORKER] Lock held by: ${lockOwner || "unknown"}. Skipping this cycle.`);
      return;
    }
    lockAcquired = true;
    console.log(`[WORKER] Lock acquired. TTL=${LOCK_TTL_SECONDS}s`);

    // ── 2. Ensure DB is connected ────────────────────────────────
    await dbConnect();

    // ── 3. Pre-cycle DB snapshot (first cycle only) ──────────────
    if (isFirstCycle) {
      await printDbStats("BEFORE");
      isFirstCycle = false;
    }

    // ── 4. Update status to RUNNING ──────────────────────────────
    await updateStatus({
      status: "RUNNING",
      workerId: WORKER_ID,
      cycleCount,
      startedAt: new Date(tStart).toISOString(),
    });

    // ── 5. Run the ingestion pipeline ────────────────────────────
    console.log(`[WORKER] Calling pollAllProviders()...`);
    cycleStats = await liveIngestionService.pollAllProviders();

    // ── 6. Post-cycle DB snapshot ────────────────────────────────
    const dbAfter = await printDbStats("AFTER");

    console.log(`[WORKER] Cycle ${cycleCount} complete.`);
    console.log(`[WORKER]   Providers healthy: ${cycleStats.providersHealthy} | failed: ${cycleStats.providersFailed}`);
    console.log(`[WORKER]   RSS items fetched: ${cycleStats.fetched}`);
    console.log(`[WORKER]   Exact duplicates: ${cycleStats.duplicates}`);
    console.log(`[WORKER]   New events published: ${cycleStats.inserted}`);
    console.log(`[WORKER]   Enrichment failed: ${cycleStats.failed}`);
    console.log(`[WORKER]   Archived (stale): ${cycleStats.archived}`);

  } catch (err: any) {
    lastError = err.message || "Unknown Error";
    console.error(`[WORKER] ❌ Cycle ${cycleCount} failed:`, lastError);
  } finally {
    const tEnd = Date.now();
    const durationMs = tEnd - tStart;
    const nextPollAt = tEnd + POLL_INTERVAL_MS;

    // ── Release lock safely ──────────────────────────────────────
    if (lockAcquired) {
      try {
        await redis.delIfOwner(WORKER_LOCK_KEY, WORKER_ID);
      } catch (e) {
        // fallback: just del without check
        try { await redis.del(WORKER_LOCK_KEY); } catch {}
      }
    }

    // ── Persist observability state ──────────────────────────────
    await updateStatus({
      status: lastError ? "ERROR" : "WAITING",
      workerId: WORKER_ID,
      lastPollAt: new Date(tStart).toISOString(),
      lastSuccessAt: lastError ? undefined : new Date().toISOString(),
      nextPollAt: new Date(nextPollAt).toISOString(),
      lastCycleDurationMs: durationMs,
      lastError: lastError || null,
      ...(cycleStats ? {
        eventsDiscovered: cycleStats.fetched,
        eventsDeduplicated: cycleStats.duplicates,
        eventsPublished: cycleStats.inserted,
        eventsArchived: cycleStats.archived,
        eventsFailed: cycleStats.failed,
        providersHealthy: cycleStats.providersHealthy,
        providersFailed: cycleStats.providersFailed,
      } : {})
    });

    console.log(`[WORKER] Duration: ${(durationMs / 1000).toFixed(1)}s | Next cycle in ${Math.round(POLL_INTERVAL_MS / 60000)} min`);

    // ── Schedule next cycle ──────────────────────────────────────
    setTimeout(runCycle, POLL_INTERVAL_MS);
  }
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────
async function main() {
  printBanner();

  console.log("[WORKER] Connecting to MongoDB...");
  await dbConnect();
  console.log("[WORKER] MongoDB connected.");

  if (redis.isReal) {
    console.log("[WORKER] Upstash Redis connected. Distributed locking ACTIVE.");
  } else {
    console.log("[WORKER] ⚠️  No Upstash credentials found. Using in-memory lock (single-process safe).");
    console.log("[WORKER] ⚠️  Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for multi-instance safety.");
  }

  // Write initial status
  await updateStatus({
    status: "STARTING",
    workerId: WORKER_ID,
    startedAt: new Date().toISOString(),
    pollIntervalMs: POLL_INTERVAL_MS,
    redisMode: redis.isReal ? "upstash" : "in-memory",
  });

  // Run the first cycle immediately (no initial delay for a standalone worker)
  console.log("[WORKER] Starting first cycle immediately...\n");
  await runCycle();
}

// ─── Keep-alive guard ─────────────────────────────────────────────────────────
// Prevents Node from exiting after the first setTimeout is queued
const keepAlive = setInterval(() => {
  // intentional no-op; just keeps the event loop alive
}, 60 * 60 * 1000);

main().catch((err) => {
  console.error("[WORKER] Fatal startup error:", err);
  clearInterval(keepAlive);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[WORKER] SIGTERM received. Releasing lock and shutting down...");
  try { await redis.delIfOwner(WORKER_LOCK_KEY, WORKER_ID); } catch {}
  clearInterval(keepAlive);
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[WORKER] SIGINT received. Shutting down...");
  try { await redis.delIfOwner(WORKER_LOCK_KEY, WORKER_ID); } catch {}
  clearInterval(keepAlive);
  process.exit(0);
});
