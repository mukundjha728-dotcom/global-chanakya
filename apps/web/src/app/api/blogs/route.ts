import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/modules/blog/services/blog.service";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  await dbConnect();
  
  // Basic query params setup
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'published';
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const blogs = await BlogService.getBlogsByStatus(status, limit);
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }



  try {
    const body = await request.json();
    const blog = await BlogService.createBlog({
      ...body,
      author: session.user.id,
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create blog", details: error }, { status: 500 });
  }
}
