import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/modules/blog/services/blog.service";
import dbConnect from "@/lib/mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const blogs = await BlogService.searchBlogs(query.trim(), 5);
    
    return NextResponse.json({ results: blogs });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to search blogs" }, { status: 500 });
  }
}
