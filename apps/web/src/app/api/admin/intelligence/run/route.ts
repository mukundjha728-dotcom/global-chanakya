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
  console.log("[INTELLIGENCE_TRIGGER] REQUEST_RECEIVED");
  let lockAcquired = false;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      console.warn("[INTELLIGENCE_TRIGGER] UNAUTHORIZED");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("[INTELLIGENCE_TRIGGER] ADMIN_AUTH_OK");

    // 1. Acquire existing distributed lock to prevent duplicate runs
    const lockResult = await redis.setNX(WORKER_LOCK_KEY, WORKER_ID, LOCK_TTL_SECONDS);
    lockAcquired = Boolean(lockResult);
    
    if (!lockAcquired) {
      console.log("[INTELLIGENCE_TRIGGER] ALREADY_RUNNING");
      return NextResponse.json({
        success: false,
        status: "ALREADY_RUNNING",
        error: "An intelligence cycle is already in progress."
      }, { status: 429 });
    }
    console.log("[INTELLIGENCE_TRIGGER] LOCK_ACQUIRED");

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
      console.log("[INTELLIGENCE_TRIGGER] INGESTION_STARTED");
      // Use strict Vercel Hobby execution budget (7s) to guarantee completion before timeout
      cycleStats = await liveIngestionService.pollAllProviders({
        maxDurationMs: 8000
      });
      
      console.log("[INTELLIGENCE_TRIGGER] INGESTION_COMPLETED");
      
      if (cycleStats && cycleStats.published > 0) {
        console.log("[INTELLIGENCE_TRIGGER] PUBLISHED");
        try {
          const { revalidateTag, revalidatePath } = require("next/cache");
          revalidateTag("intelligence");
          revalidateTag("homepage-live-events");
          revalidatePath("/");
          revalidatePath("/live");
          revalidatePath("/intelligence");
          revalidatePath("/gc-control-9x7k/intelligence");
          console.log("[INTELLIGENCE_TRIGGER] CACHE_REVALIDATED");
        } catch (e) {
          console.warn("[INTELLIGENCE_TRIGGER] CACHE_REVALIDATION_FAILED", e);
        }
      } else {
        console.log("[INTELLIGENCE_TRIGGER] NO_NEW_PUBLISHED");
      }
    } catch (err: any) {
      console.error("[INTELLIGENCE_TRIGGER] FAILED_STAGE=INGESTION", err);
      lastError = err.message || "Unknown Error";
    } finally {
      const durationMs = Date.now() - tStart;
      
      // Ensure lock release
      if (lockAcquired) {
        try {
          await redis.delIfOwner(WORKER_LOCK_KEY, WORKER_ID);
          console.log("[INTELLIGENCE_TRIGGER] LOCK_RELEASED");
        } catch (e) {
          try { await redis.del(WORKER_LOCK_KEY); } catch {}
        }
      }

      const isPartial = cycleStats?.status === 'partial';
      const statusString = lastError ? "FAILED" : isPartial ? "PARTIAL" : "SUCCESS";
      
      const finalStatus = {
        status: statusString,
        lastRun: new Date(tStart).toISOString(),
        lastSuccessfulRun: lastError ? undefined : new Date().toISOString(),
        processed: cycleStats?.fetched || 0,
        published: cycleStats?.published || 0,
        pending: cycleStats?.pending || 0,
        deduplicated: cycleStats?.duplicates || 0,
        failed: cycleStats?.failed || 0,
        duration: durationMs,
        error: lastError || (isPartial ? cycleStats?.error : null),
      };

      // Persist final status
      await updateWorkerStatus(finalStatus);

      console.log("[INTELLIGENCE_TRIGGER] REQUEST_COMPLETED");

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
          status: statusString,
          stats: finalStatus
        });
      }
    }

  } catch (error: any) {
    console.error("[INTELLIGENCE_TRIGGER] FAILED_STAGE=API", error);
    if (lockAcquired) {
      try { await redis.delIfOwner(WORKER_LOCK_KEY, WORKER_ID); } catch {}
    }
    return NextResponse.json(
      { success: false, status: "FAILED", error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

