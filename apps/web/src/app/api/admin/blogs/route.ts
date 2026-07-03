import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { BlogService } from "@/modules/blog/services/blog.service";
import mongoose from "mongoose";
import { createBlogSchema } from "@/lib/validators/blog.schema";

// Give Vercel 30s before cutting off the function
export const maxDuration = 30;

async function requireAdmin() {
  // Run auth check and DB connection in parallel — saves ~500ms
  const [session] = await Promise.all([auth(), dbConnect()]);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

// Helper: clean error message from any error type
function errorMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

// GET - fetch single blog or list
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const blog = await BlogService.getBlogById(id);
      if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(blog);
    }

    const blogs = await BlogService.getAdminBlogs();
    return NextResponse.json(blogs);
  } catch (err) {
    console.error("[GET /api/admin/blogs]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}

// POST - create new blog
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    
    // Validating request body with Zod
    const validation = createBlogSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: (validation.error as any).errors[0].message, details: validation.error.format() }, { status: 400 });
    }

    const { title, slug, excerpt, content, category, tags, visibility, status,
      isTrending, commentsEnabled, seo, featuredImage } = validation.data;

    // Get author ObjectId
    let authorObjectId: mongoose.Types.ObjectId;
    authorObjectId = new mongoose.Types.ObjectId();

    // Handle slug conflict: if slug exists, append timestamp suffix
    let finalSlug = slug;
    const existing = await BlogService.getBlogBySlug(slug);
    if (existing) {
      // If it's a draft with same slug, just update it instead of creating duplicate
      if (existing.status === "draft") {
        const updateData: Record<string, unknown> = {
          title, excerpt, content, category,
          tags: tags ?? [],
          visibility: visibility ?? "public",
          status: status ?? "published",
          isTrending: isTrending ?? false,
          commentsEnabled: commentsEnabled ?? true,
          featuredImage: featuredImage ?? "",
          seo: {
            title: seo?.title || title,
            description: seo?.description || excerpt,
            keywords: seo?.keywords ?? [],
          },
          publishAt: new Date(),
        };
        const updated = await BlogService.updateBlog(existing._id.toString(), updateData);
        return NextResponse.json({ success: true, id: updated!._id.toString(), slug: updated!.slug }, { status: 200 });
      }
      // Otherwise auto-fix slug with timestamp
      finalSlug = `${slug}-${Date.now()}`;
    }

    const blog = await BlogService.createBlog({
      title,
      slug: finalSlug,
      excerpt,
      content,
      category,
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
  } catch (err) {
    console.error("[POST /api/admin/blogs]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}

// PATCH - update blog (admin - permissive, trusts editor)
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    // Allowlist updatable fields (everything from the editor)
    const ALLOWED = [
      "title", "slug", "excerpt", "content", "category", "tags",
      "visibility", "status", "isTrending", "commentsEnabled",
      "featuredImage", "ogImage", "seo", "aiSummary",
      "publishAt", "unpublishAt", "isBreaking", "breakingUntil",
      "isFeatured", "featuredUntil", "citations",
      "entityRelations", "draftSnapshot", "previousVersions",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of ALLOWED) {
      if (rest[key] !== undefined) updateData[key] = rest[key];
    }
    if (rest.status === "published" && !rest.publishAt) {
      updateData.publishAt = new Date();
    }

    const updated = await BlogService.updateBlog(id, updateData);
    if (!updated) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/blogs]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}


// DELETE - delete blog
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Blog ID required" }, { status: 400 });

    const deleted = await BlogService.deleteBlog(id);
    if (!deleted) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/blogs]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}
