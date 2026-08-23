import { NextResponse } from "next/server";
import { redisCache } from "@/lib/cache/redis.cache";
import dbConnect from "@/lib/mongoose";
import { IntelligenceEvent } from "@/lib/models/IntelligenceEvent";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const stats = await redisCache.get<any>("live_ingestion_stats") || null;
    
    const activeEvents = await IntelligenceEvent.countDocuments({ status: "published" });
    const archivedEvents = await IntelligenceEvent.countDocuments({ status: "archived" });
    
    // Check circuit breakers for providers
    const bbc = await redisCache.get<number>("circuit_breaker:rss:BBC") || 0;
    const alJazeera = await redisCache.get<number>("circuit_breaker:rss:Al_Jazeera") || 0;
    const unNews = await redisCache.get<number>("circuit_breaker:rss:UN_News") || 0;

    return NextResponse.json({
      success: true,
      lastRefresh: stats?.timestamp || "Never",
      ingestionStats: stats || { fetched: 0, duplicates: 0, inserted: 0, failed: 0, archived: 0, durationMs: 0 },
      events: {
        active: activeEvents,
        archived: archivedEvents
      },
      providers: {
        bbc: bbc >= 3 ? "FAILED" : "HEALTHY",
        alJazeera: alJazeera >= 3 ? "FAILED" : "HEALTHY",
        unNews: unNews >= 3 ? "FAILED" : "HEALTHY"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
