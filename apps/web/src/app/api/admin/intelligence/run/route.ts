import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { redis } from "@/lib/redis";
import { liveIngestionService } from "@/lib/intelligence/live/ingestion.service";
import dbConnect from "@/lib/mongoose";
import { after } from "next/server";

const WORKER_LOCK_KEY = "intelligence:worker:lock";
const WORKER_STATUS_KEY = "intelligence:worker:status";

const LOCK_TTL_SECONDS = 300; // 5 minutes max for manual run lock
const WORKER_ID = `admin-manual-${Date.now()}`;

export async function POST() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Acquire existing distributed lock to prevent duplicate runs
    const lockAcquired = await redis.setNX(WORKER_LOCK_KEY, WORKER_ID, LOCK_TTL_SECONDS);
    
    if (!lockAcquired) {
      return NextResponse.json({
        success: false,
        status: "already_running",
        error: "An intelligence cycle is already in progress."
      });
    }

    // Prepare status update helper
    const updateWorkerStatus = async (statusFields: any) => {
      try {
        const current = (await redis.get<any>(WORKER_STATUS_KEY)) || {};
        await redis.set(WORKER_STATUS_KEY, { ...current, ...statusFields });
      } catch (e) {
        // Safe fail
      }
    };

    // 2. Set initial RUNNING status
    await updateWorkerStatus({
      status: "RUNNING",
      workerId: WORKER_ID,
      startedAt: new Date().toISOString(),
      triggeredBy: "admin"
    });

    // 3. Define the background task
    const executeIntelligenceCycle = async () => {
      const tStart = Date.now();
      let lastError: string | null = null;
      let cycleStats: any = null;

      try {
        await dbConnect();
        cycleStats = await liveIngestionService.pollAllProviders();
      } catch (err: any) {
        console.error("[IntelligenceAdminAPI] Execution failed:", err);
        lastError = err.message || "Unknown Error";
      } finally {
        const durationMs = Date.now() - tStart;
        
        // Ensure lock release
        try {
          await redis.delIfOwner(WORKER_LOCK_KEY, WORKER_ID);
        } catch (e) {
          try { await redis.del(WORKER_LOCK_KEY); } catch {}
        }

        // Persist final status
        await updateWorkerStatus({
          status: lastError ? "ERROR" : "WAITING",
          lastPollAt: new Date(tStart).toISOString(),
          lastSuccessAt: lastError ? undefined : new Date().toISOString(),
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
      }
    };

    // 4. Safely execute in background, unblocking the HTTP response
    if (typeof after === "function") {
      after(executeIntelligenceCycle);
    } else {
      executeIntelligenceCycle().catch(() => {});
    }

    return NextResponse.json({
      success: true,
      status: "started",
      message: "Intelligence cycle initiated successfully."
    });

  } catch (error: any) {
    console.error("[IntelligenceAdminAPI] Run request failed:", error);
    return NextResponse.json(
      { success: false, status: "failed", error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
