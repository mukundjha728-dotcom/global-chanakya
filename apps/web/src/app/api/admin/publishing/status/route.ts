import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { redis } from "@/lib/redis";
import { BlogPublishingRun } from "@/lib/models/BlogPublishingRun";

const PUBLISHING_STATUS_KEY = "publishing:engine:status";

async function requireAdmin() {
  const [session] = await Promise.all([auth(), dbConnect()]);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Try fast path first
    const fastStatus = await redis.get(PUBLISHING_STATUS_KEY);
    
    // Always fetch latest run from DB to get full details
    const activeRun = await BlogPublishingRun.findOne()
      .sort({ createdAt: -1 })
      .lean();

    if (!activeRun) {
      return NextResponse.json({ status: "IDLE", message: "No recent publishing runs.", publishingEnabled: process.env.BLOG_PUBLISHING_ENABLED === "true" });
    }

    return NextResponse.json({
      runId: activeRun.runId,
      status: activeRun.status,
      currentCategory: activeRun.currentCategory,
      totalCategories: activeRun.totalCategories,
      completedCategories: activeRun.completedCategories,
      skippedCategories: activeRun.skippedCategories,
      failedCategories: activeRun.failedCategories,
      publishedCount: activeRun.publishedBlogIds.length,
      startedAt: activeRun.startedAt,
      completedAt: activeRun.completedAt,
      isDryRun: activeRun.isDryRun,
      categoryResults: activeRun.categoryResults,
      publishingEnabled: process.env.BLOG_PUBLISHING_ENABLED === "true"
    });

  } catch (err: any) {
    console.error("[GET /api/admin/publishing/status]", err);
    return NextResponse.json({ error: err.message || "Internal Error" }, { status: 500 });
  }
}
