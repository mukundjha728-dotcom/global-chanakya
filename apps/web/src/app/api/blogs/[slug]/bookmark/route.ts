import { NextRequest, NextResponse } from "next/server";
import { Blog } from "@/lib/models/Blog";
import { auth } from "@/auth";
import { BookmarkService } from "@/modules/bookmark/services/bookmark.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to save articles" }, { status: 401 });
  }

  const { slug } = await params;
  const blog = await Blog.findOne({ slug, status: "published" });
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  try {
    const result = await BookmarkService.toggleBookmark(session.user.id, blog._id.toString());
    
    // Update analytics counter (in background)
    Blog.updateOne(
      { _id: blog._id },
      { $inc: { "analytics.bookmarks": result.status === "added" ? 1 : -1 } }
    ).exec();

    const updated = await Blog.findById(blog._id).lean() as any;
    
    return NextResponse.json({
      bookmarked: result.status === "added",
      bookmarks: (updated?.analytics?.bookmarks || 0) + (result.status === "added" ? 1 : -1),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process bookmark" }, { status: 500 });
  }
}

// GET — check if user has bookmarked
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const { slug } = await params;

  const blog = await Blog.findOne({ slug, status: "published" }).lean() as any;
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  let bookmarked = false;
  if (session?.user?.id) {
    bookmarked = await BookmarkService.isBookmarked(session.user.id, blog._id.toString());
  }

  return NextResponse.json({
    bookmarked,
    bookmarks: blog.analytics?.bookmarks || 0,
  });
}
