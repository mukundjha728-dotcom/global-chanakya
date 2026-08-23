import { NextResponse } from "next/server";
import { liveIngestionService } from "@/lib/intelligence/live/ingestion.service";
import dbConnect from "@/lib/mongoose";
import { markIngestionComplete } from "@/lib/intelligence/live/demandRefresh";

export async function GET(request: Request) {
  return handleRefresh(request);
}

export async function POST(request: Request) {
  return handleRefresh(request);
}

async function handleRefresh(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isInternal = authHeader === `Bearer ${process.env.INTERNAL_CRON_SECRET || 'dev-secret'}`;

    if (!isCron && !isInternal) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await dbConnect();
    const stats = await liveIngestionService.pollAllProviders();

    // Safely mark ingestion as completed (releases lock and updates timestamp)
    await markIngestionComplete().catch(err => console.error("[InternalRefreshAPI] Error releasing lock:", err));

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[InternalRefreshAPI] Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
