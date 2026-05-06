import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  await dbConnect();
  
  // Basic query params setup
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'published';
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const blogs = await Blog.find({ status }).sort({ publishAt: -1 }).limit(limit).populate('author', 'name avatar');
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || ((session.user as any)?.role !== 'admin')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const blog = new Blog({
      ...body,
      author: (session.user as any).id,
    });
    
    // Calculate earlyAccessUntil if premium
    if (body.visibility === 'premium' && body.publishAt) {
      const publishDate = new Date(body.publishAt);
      blog.earlyAccessUntil = new Date(publishDate.getTime() + 24 * 60 * 60 * 1000); // +24 hours
    }

    await blog.save();
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create blog", details: error }, { status: 500 });
  }
}
