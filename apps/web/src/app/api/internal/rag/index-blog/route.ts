import { NextRequest, NextResponse } from "next/server";
import { ragIndexerService } from "@/modules/intelligence/services/ragIndexer.service";

export async function POST(req: NextRequest) {
  try {
    // Basic Internal Auth
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "local-dev-secret";
    
    if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blogId, action } = await req.json();

    if (!blogId) {
      return NextResponse.json({ error: "blogId is required" }, { status: 400 });
    }

    if (action === "unindex") {
      await ragIndexerService.unindexBlog(blogId);
      return NextResponse.json({ success: true, message: "Blog unindexed" }, { status: 200 });
    }

    // Default action is index
    const result = await ragIndexerService.indexBlog(blogId);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Indexed ${result.chunks} chunks for blog ${blogId}` 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[POST /api/internal/rag/index-blog]", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
