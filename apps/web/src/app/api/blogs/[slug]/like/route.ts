import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { BlogService } from "@/modules/blog/services/blog.service";
import { auth } from "@/auth";
import { Like } from "@/lib/models/Like";
import * as Sentry from "@sentry/nextjs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ error: "Sign in to like articles" }, { status: 401 });
  }

  const { slug } = await params;
  await dbConnect();

  const blog = await BlogService.getBlogBySlug(slug);
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  const userId = session.user.id || session.user.email;

  try {
    // Check if already liked
    const existingLike = await Like.findOne({ user: userId, blog: blog._id });

    if (existingLike) {
      // Unlike
      const result = await Like.deleteOne({ _id: existingLike._id });
      if (result.deletedCount > 0) {
        await BlogService.incrementAnalytics(blog._id.toString(), "likes", -1);
      }
      const updated = await BlogService.getBlogById(blog._id.toString());
      return NextResponse.json({
        liked: false,
        likes: updated?.analytics?.likes || 0,
      });
    } else {
      // Like
      try {
        await Like.create({ user: userId, blog: blog._id });
        await BlogService.incrementAnalytics(blog._id.toString(), "likes", 1);
      } catch (e: any) {
        // 11000 is Duplicate Key Error
        if (e.code !== 11000) {
          Sentry.captureException(e, {
            extra: { userId, blogId: blog._id.toString(), action: "like_create" }
          });
          console.error({ event: "like_failure", userId, blogId: blog._id.toString(), error: e.message, timestamp: new Date().toISOString() });
          throw e;
        }
      }
      const updated = await BlogService.getBlogById(blog._id.toString());
      return NextResponse.json({
        liked: true,
        likes: updated?.analytics?.likes || 0,
      });
    }
  } catch (error: any) {
    Sentry.captureException(error, { extra: { slug, action: "process_like_route" } });
    console.error({ event: "process_like_failure", error: error.message, timestamp: new Date().toISOString() });
    return NextResponse.json({ error: "Failed to process like" }, { status: 500 });
  }
}

// GET — check if user has liked
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const { slug } = await params;
  await dbConnect();

  const blog = await BlogService.getBlogBySlug(slug);
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  let liked = false;
  const userId = session?.user?.id || session?.user?.email;
  if (userId) {
    const existing = await Like.findOne({ user: userId, blog: blog._id });
    liked = !!existing;
  }

  return NextResponse.json({
    liked,
    likes: blog.analytics?.likes || 0,
  });
}
