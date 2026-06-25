import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { BlogService } from "@/modules/blog/services/blog.service";
import { auth } from "@/auth";
import mongoose from "mongoose";

// Simple schema for tracking user likes (prevents double-likes)
const LikeSchema = new mongoose.Schema({
  user: { type: String, required: true },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
}, { timestamps: true });

LikeSchema.index({ user: 1, blog: 1 }, { unique: true });

const Like = mongoose.models.Like || mongoose.model("Like", LikeSchema);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to like articles" }, { status: 401 });
  }

  const { slug } = await params;
  await dbConnect();

  const blog = await BlogService.getBlogBySlug(slug);
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  const userId = session.user.email;

  try {
    // Check if already liked
    const existingLike = await Like.findOne({ user: userId, blog: blog._id });

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
      await BlogService.incrementAnalytics(blog._id.toString(), "likes", -1);
      const updated = await BlogService.getBlogById(blog._id.toString());
      return NextResponse.json({
        liked: false,
        likes: updated?.analytics?.likes || 0,
      });
    } else {
      // Like
      await Like.create({ user: userId, blog: blog._id });
      await BlogService.incrementAnalytics(blog._id.toString(), "likes", 1);
      const updated = await BlogService.getBlogById(blog._id.toString());
      return NextResponse.json({
        liked: true,
        likes: updated?.analytics?.likes || 0,
      });
    }
  } catch (error) {
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
  if (session?.user?.email) {
    const existing = await Like.findOne({ user: session.user.email, blog: blog._id });
    liked = !!existing;
  }

  return NextResponse.json({
    liked,
    likes: blog.analytics?.likes || 0,
  });
}
