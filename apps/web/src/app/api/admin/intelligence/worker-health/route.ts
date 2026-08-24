import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import dbConnect from "@/lib/mongoose";

// Simple admin auth check — reuse existing admin session pattern
async function isAdmin(request: NextRequest): Promise<boolean> {
  // Only allow from trusted origins or with the admin token header
  const adminToken = request.headers.get("x-admin-token");
  if (adminToken && adminToken === process.env.ADMIN_WORKER_TOKEN) return true;
  // Fallback: allow from same-origin (browser admin panel)
  const referer = request.headers.get("referer") || "";
  const host = request.headers.get("host") || "";
  return referer.includes(host);
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const status = await redis.get<any>("intelligence:worker:status");
    const lastStats = await redis.get<any>("live_ingestion_stats");

    // Determine staleness
    let workerHealth: "RUNNING" | "WAITING" | "STALE" | "ERROR" | "UNKNOWN" = "UNKNOWN";
    const STALE_GRACE_MS = 30 * 60 * 1000; // 30 min grace

    if (status) {
      if (status.status === "RUNNING") {
        workerHealth = "RUNNING";
      } else if (status.status === "ERROR") {
        workerHealth = "ERROR";
      } else if (status.nextPollAt) {
        const nextPoll = new Date(status.nextPollAt).getTime();
        if (Date.now() > nextPoll + STALE_GRACE_MS) {
          workerHealth = "STALE";
        } else {
          workerHealth = "WAITING";
        }
      }
    }

    return NextResponse.json({
      success: true,
      workerHealth,
      worker: status ? {
        workerId: status.workerId,
        status: status.status,
        startedAt: status.startedAt,
        lastPollAt: status.lastPollAt,
        lastSuccessAt: status.lastSuccessAt,
        nextPollAt: status.nextPollAt,
        lastCycleDurationMs: status.lastCycleDurationMs,
        cycleCount: status.cycleCount,
        redisMode: status.redisMode,
        pollIntervalMs: status.pollIntervalMs,
        lastError: status.lastError,
        eventsDiscovered: status.eventsDiscovered,
        eventsDeduplicated: status.eventsDeduplicated,
        eventsPublished: status.eventsPublished,
        eventsArchived: status.eventsArchived,
        eventsFailed: status.eventsFailed,
        providersHealthy: status.providersHealthy,
        providersFailed: status.providersFailed,
      } : null,
      lastIngestion: lastStats || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
