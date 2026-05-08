import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { auth } from "@/auth";
import PremiumLock from "@/components/blogs/PremiumLock";
import { ArrowLeft, Clock, Eye, Calendar } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const blog = await Blog.findOne({ slug, status: "published" });

  if (!blog) {
    return { title: "Not Found" };
  }

  return {
    title: blog.seo?.title || blog.title,
    description: blog.seo?.description || blog.excerpt,
    keywords: blog.seo?.keywords || blog.tags,
    openGraph: {
      title: blog.seo?.title || blog.title,
      description: blog.seo?.description || blog.excerpt,
      images: blog.featuredImage ? [blog.featuredImage] : [],
      type: "article",
      publishedTime: blog.publishAt.toISOString(),
      authors: [blog.author?.name || "Global Chanakya"],
    },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const session = await auth();

  const blog = await Blog.findOne({ slug, status: "published" }).populate("author", "name");

  if (!blog) {
    notFound();
  }

  const readTime = Math.ceil(blog.content.split(" ").length / 200);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back nav */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Latest Intel
        </Link>

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold uppercase tracking-wide">
              {blog.category}
            </span>
            {blog.visibility === "premium" && (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wide">
                ⚡ Premium
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6 text-white">
            {blog.title}
          </h1>

          <p className="text-xl text-gray-400 leading-relaxed mb-8 border-l-4 border-rose-500/40 pl-4">
            {blog.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-8 border-b border-white/[0.07]">
            <span className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xs font-bold">
                {(blog.author?.name || "G")[0]}
              </div>
              <span className="text-gray-300">{blog.author?.name || "Global Chanakya Editorial"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(blog.publishAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {readTime} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {(blog.analytics?.views || 0).toLocaleString()} views
            </span>
          </div>
        </header>

        {/* Featured Image */}
        {blog.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full rounded-2xl mb-10 object-cover max-h-[480px] border border-white/10"
          />
        )}

        {/* Article Content */}
        <PremiumLock earlyAccessUntil={blog.earlyAccessUntil} userRole={(session?.user as any)?.role}>
          <div
            className="prose prose-lg prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-white
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-rose-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-blockquote:border-l-rose-500 prose-blockquote:text-gray-400
              prose-code:bg-white/10 prose-code:text-rose-300 prose-code:rounded prose-code:px-1
              prose-hr:border-white/10"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </PremiumLock>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/[0.07]">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/blogs?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/20 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-16 text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            View all reports
          </Link>
        </div>
      </div>
    </div>
  );
}
