import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { Comment } from "@/lib/models/Comment";
import { User } from "@/lib/models/User";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await dbConnect();

  const blog = await Blog.findOne({ slug, status: "published" }).lean() as any;
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  const comments = await Comment.find({ blog: blog._id, status: "approved" })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({ comments, count: comments.length });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });
  }

  const { slug } = await params;
  await dbConnect();

  const blog = await Blog.findOne({ slug, status: "published" });
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  if (!blog.commentsEnabled) {
    return NextResponse.json({ error: "Comments are disabled for this article" }, { status: 403 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    if (content.trim().length > 1000) {
      return NextResponse.json({ error: "Comment too long (max 1000 characters)" }, { status: 400 });
    }

    const comment = await Comment.create({
      user: user._id,
      blog: blog._id,
      content: content.trim(),
      status: "approved",
    });

    const populated = await Comment.findById(comment._id)
      .populate("user", "name avatar")
      .lean();

    return NextResponse.json({ comment: populated }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
