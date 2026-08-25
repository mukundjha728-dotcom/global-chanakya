import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { redis } from "@/lib/redis";
import { liveIngestionService } from "@/lib/intelligence/live/ingestion.service";
import dbConnect from "@/lib/mongoose";

const WORKER_LOCK_KEY = "intelligence:worker:lock";
const WORKER_STATUS_KEY = "intelligence:worker:status";

const LOCK_TTL_SECONDS = 300; // 5 minutes max for manual run lock
const WORKER_ID = `admin-manual-${Date.now()}`;

export const maxDuration = 300; // Prevent Vercel from timing out this API route prematurely

export async function POST() {
  let lockAcquired = false;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Acquire existing distributed lock to prevent duplicate runs
    lockAcquired = await redis.setNX(WORKER_LOCK_KEY, WORKER_ID, LOCK_TTL_SECONDS) ?? false;
    
    if (!lockAcquired) {
      return NextResponse.json({
        success: false,
        status: "ALREADY_RUNNING",
        error: "An intelligence cycle is already in progress."
      }, { status: 429 });
    }

    // Prepare status update helper
    const updateWorkerStatus = async (statusFields: any) => {
      try {
        const current = (await redis.get<any>(WORKER_STATUS_KEY)) || {};
        await redis.set(WORKER_STATUS_KEY, { ...current, ...statusFields }, "EX", LOCK_TTL_SECONDS + 3600);
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

    // 3. Await the pipeline directly
    const tStart = Date.now();
    let lastError: string | null = null;
    let cycleStats: any = null;

    try {
      await dbConnect();
      cycleStats = await liveIngestionService.pollAllProviders();
      
      if (cycleStats && cycleStats.published > 0) {
        try {
          const { revalidateTag, revalidatePath } = require("next/cache");
          revalidateTag("intelligence");
          revalidateTag("homepage-live-events");
          revalidatePath("/");
          revalidatePath("/live");
          revalidatePath("/intelligence");
          revalidatePath("/gc-control-9x7k/intelligence");
        } catch (e) {
          console.warn("[IntelligenceAdminAPI] Revalidation failed:", e);
        }
      }
    } catch (err: any) {
      console.error("[IntelligenceAdminAPI] Execution failed:", err);
      lastError = err.message || "Unknown Error";
    } finally {
      const durationMs = Date.now() - tStart;
      
      // Ensure lock release
      if (lockAcquired) {
        try {
          await redis.delIfOwner(WORKER_LOCK_KEY, WORKER_ID);
        } catch (e) {
          try { await redis.del(WORKER_LOCK_KEY); } catch {}
        }
      }

      const finalStatus = {
        status: lastError ? "FAILED" : "SUCCESS",
        lastRun: new Date(tStart).toISOString(),
        lastSuccessfulRun: lastError ? undefined : new Date().toISOString(),
        processed: cycleStats?.fetched || 0,
        published: cycleStats?.published || 0,
        deduplicated: cycleStats?.duplicates || 0,
        failed: cycleStats?.failed || 0,
        duration: durationMs,
        error: lastError || null,
      };

      // Persist final status
      await updateWorkerStatus(finalStatus);

      // Return actual pipeline statistics in HTTP response
      if (lastError) {
        return NextResponse.json({
          success: false,
          status: "FAILED",
          error: lastError,
          stats: finalStatus
        }, { status: 500 });
      } else {
        return NextResponse.json({
          success: true,
          status: "SUCCESS",
          stats: finalStatus
        });
      }
    }

  } catch (error: any) {
    console.error("[IntelligenceAdminAPI] Run request failed:", error);
    if (lockAcquired) {
      try { await redis.delIfOwner(WORKER_LOCK_KEY, WORKER_ID); } catch {}
    }
    return NextResponse.json(
      { success: false, status: "FAILED", error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
