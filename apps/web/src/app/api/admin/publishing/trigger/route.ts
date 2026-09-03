import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { blogPublishingEngine } from "@/modules/blog/services/blogPublishingEngine.service";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const [session] = await Promise.all([auth(), dbConnect()]);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const isDryRun = !!body.isDryRun;

    if (!isDryRun && process.env.BLOG_PUBLISHING_ENABLED !== "true") {
      return NextResponse.json(
        { error: "Production publishing is currently disabled by server configuration (BLOG_PUBLISHING_ENABLED=false). Please use Dry Run or enable publishing." },
        { status: 403 }
      );
    }

    // Synchronously process exactly ONE publication
    const result = await blogPublishingEngine.processNextPublication(isDryRun);

    return NextResponse.json({
      success: true,
      ...result,
      message: "Processed exactly one publication."
    }, { status: 200 });

  } catch (err: any) {
    console.error("[POST /api/admin/publishing/trigger]", err);
    if (err.message?.includes("currently executing") || err.message?.includes("current sequence")) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || "Internal Error" }, { status: 500 });
  }
}
