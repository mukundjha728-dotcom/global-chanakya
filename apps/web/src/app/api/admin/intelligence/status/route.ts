import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { redis } from "@/lib/redis";

const WORKER_STATUS_KEY = "intelligence:worker:status";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await redis.get<any>(WORKER_STATUS_KEY);

    return NextResponse.json({
      success: true,
      status: status || { status: "IDLE" }
    });
  } catch (error: any) {
    console.error("[IntelligenceAdminAPI] Error fetching status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
