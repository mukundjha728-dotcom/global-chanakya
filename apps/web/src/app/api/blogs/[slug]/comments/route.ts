import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/modules/blog/services/blog.service";
import { UserService } from "@/modules/user/services/user.service";
import { CommentService } from "@/modules/comment/services/comment.service";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const blog = await BlogService.getBlogBySlug(slug);
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  const comments = await CommentService.getCommentsForBlog(blog._id.toString());

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
  const blog = await BlogService.getBlogBySlug(slug);
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  if (!blog.commentsEnabled) {
    return NextResponse.json({ error: "Comments are disabled for this article" }, { status: 403 });
  }

  const user = await UserService.getUserByEmail(session.user.email);
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

    const populated = await CommentService.createComment({
      user: user._id.toString(),
      blog: blog._id.toString(),
      content: content.trim(),
      status: "approved",
    });

    return NextResponse.json({ comment: populated }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
