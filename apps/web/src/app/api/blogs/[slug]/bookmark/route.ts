import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { User } from "@/lib/models/User";
import { auth } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to save articles" }, { status: 401 });
  }

  const { slug } = await params;
  await dbConnect();

  const blog = await Blog.findOne({ slug, status: "published" });
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const isBookmarked = user.bookmarks?.includes(blog._id);

    if (isBookmarked) {
      // Remove bookmark
      await User.updateOne(
        { _id: user._id },
        { $pull: { bookmarks: blog._id } }
      );
      await Blog.updateOne(
        { _id: blog._id },
        { $inc: { "analytics.bookmarks": -1 } }
      );
      const updated = await Blog.findById(blog._id).lean() as any;
      return NextResponse.json({
        bookmarked: false,
        bookmarks: updated.analytics?.bookmarks || 0,
      });
    } else {
      // Add bookmark
      await User.updateOne(
        { _id: user._id },
        { $addToSet: { bookmarks: blog._id } }
      );
      await Blog.updateOne(
        { _id: blog._id },
        { $inc: { "analytics.bookmarks": 1 } }
      );
      const updated = await Blog.findById(blog._id).lean() as any;
      return NextResponse.json({
        bookmarked: true,
        bookmarks: updated.analytics?.bookmarks || 0,
      });
    }
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
  await dbConnect();

  const blog = await Blog.findOne({ slug, status: "published" }).lean() as any;
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  let bookmarked = false;
  if (session?.user?.email) {
    const user = await User.findOne({ email: session.user.email }).lean() as any;
    bookmarked = user?.bookmarks?.some((b: any) => b.toString() === blog._id.toString()) ?? false;
  }

  return NextResponse.json({
    bookmarked,
    bookmarks: blog.analytics?.bookmarks || 0,
  });
}
