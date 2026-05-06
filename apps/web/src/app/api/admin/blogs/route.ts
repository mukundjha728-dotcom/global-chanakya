import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { User } from "@/lib/models/User";
import mongoose from "mongoose";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return null;
  return session;
}

// GET - fetch single blog or list
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const blog = await Blog.findById(id).lean();
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(blog);
  }

  const blogs = await Blog.find({}).sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json(blogs);
}

// POST - create new blog
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const body = await req.json();

  const { title, slug, excerpt, content, category, tags, visibility, status,
    isTrending, commentsEnabled, seo, featuredImage, authorId } = body;

  if (!title || !slug || !excerpt || !content || !category) {
    return NextResponse.json({ error: "Required fields missing: title, slug, excerpt, content, category" }, { status: 400 });
  }

  // Get author ObjectId
  let authorObjectId: mongoose.Types.ObjectId;
  try {
    const adminUser = await User.findOne({ email: (session.user as any).email });
    authorObjectId = adminUser?._id ?? new mongoose.Types.ObjectId();
  } catch {
    authorObjectId = new mongoose.Types.ObjectId();
  }

  // Check slug uniqueness
  const existing = await Blog.findOne({ slug });
  if (existing) {
    return NextResponse.json({ error: `Slug "${slug}" already exists. Ek alag slug choose karein.` }, { status: 409 });
  }

  const blog = await Blog.create({
    title, slug, excerpt, content, category,
    tags: tags ?? [],
    visibility: visibility ?? "public",
    status: status ?? "draft",
    isTrending: isTrending ?? false,
    commentsEnabled: commentsEnabled ?? true,
    featuredImage: featuredImage ?? "",
    seo: {
      title: seo?.title || title,
      description: seo?.description || excerpt,
      keywords: seo?.keywords ?? [],
    },
    author: authorObjectId,
    publishAt: new Date(),
    analytics: { views: 0, likes: 0, bookmarks: 0, readTime: 0, ctr: 0 },
  });

  return NextResponse.json({ success: true, id: blog._id.toString(), slug: blog.slug }, { status: 201 });
}

// PATCH - update blog
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const body = await req.json();
  const { id, status, ...rest } = body;

  if (!id) return NextResponse.json({ error: "Blog ID required" }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (rest.title) updateData.title = rest.title;
  if (rest.slug) updateData.slug = rest.slug;
  if (rest.excerpt) updateData.excerpt = rest.excerpt;
  if (rest.content) updateData.content = rest.content;
  if (rest.category) updateData.category = rest.category;
  if (rest.tags) updateData.tags = rest.tags;
  if (rest.visibility) updateData.visibility = rest.visibility;
  if (rest.featuredImage !== undefined) updateData.featuredImage = rest.featuredImage;
  if (rest.isTrending !== undefined) updateData.isTrending = rest.isTrending;
  if (rest.commentsEnabled !== undefined) updateData.commentsEnabled = rest.commentsEnabled;
  if (rest.seo) updateData.seo = rest.seo;

  const updated = await Blog.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  if (!updated) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}

// DELETE - delete blog
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Blog ID required" }, { status: 400 });

  const deleted = await Blog.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
