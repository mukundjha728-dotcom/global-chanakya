import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";
import { cache } from "react";

export const revalidate = 3600;

import BlogActions from "@/components/blogs/BlogActions";
import ReadingProgress from "@/components/blogs/ReadingProgress";
import BlogClientTracker from "@/components/blogs/BlogClientTracker";
import { generateSeoMetadata, calculateReadingTime, formatDate } from "@repo/utils";
import { formatViews } from "@/lib/formatViews";
import { ArrowLeft, Clock, Eye, Calendar, Tag, Crown, TrendingUp, Crosshair, Newspaper } from "lucide-react";
import { SITE_URL } from "@/constants";
import AdUnit, { InArticleAd, SidebarAd } from "@/components/ads/AdUnit";

import { generateBlogJsonLd, sanitizeOgImageUrl } from "@/lib/seo/generateBlogJsonLd";

// Global cache across requests
const getCachedBlog = unstable_cache(
  async (slug: string) => {
    await dbConnect();
    const blog = await Blog.findOne({ slug, contentType: { $ne: "platform-seo" } })
      .populate("author", "name authorSlug bio expertise socialLinks avatar")
      .populate("categoryId", "name slug")
      .populate("topics", "name slug")
      .populate("countries", "name slug")
      .populate("regions", "name slug")
      .populate("leaders", "name slug")
      .populate("conflicts", "name slug")
      .populate("organizations", "name slug")
      .lean();
    return blog ? JSON.parse(JSON.stringify(blog)) : null;
  },
  ["blog-detail-cache"],
  { revalidate: 3600, tags: ["blogs"] }
);

const getCachedRelatedBlogs = unstable_cache(
  async (blogId: string, category: string) => {
    await dbConnect();
    
    const latestBlogs = await Blog.find({
      status: "published",
      _id: { $ne: blogId },
      category: category
    }).sort({ publishAt: -1 }).limit(4).lean();

    const latestIds = latestBlogs.map(b => b._id);

    const mostViewedBlogs = await Blog.find({
      status: "published",
      _id: { $ne: blogId, $nin: latestIds },
      category: category
    }).sort({ "analytics.views": -1 }).limit(2).lean();

    const related = [...latestBlogs, ...mostViewedBlogs];
    return JSON.parse(JSON.stringify(related));
  },
  ["related-blogs-cache-v2"],
  { revalidate: 3600, tags: ["blogs"] }
);

// Request-level cache deduplication
const getBlogData = cache(async (slug: string) => {
  return await getCachedBlog(slug);
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const blog = await getBlogData(decodedSlug);
  
  if (!blog) return { title: "Not Found" };
  return generateSeoMetadata({
    title: blog.seo?.title || blog.title,
    description: blog.seo?.description || blog.excerpt,
    keywords: blog.seo?.keywords?.join?.(", ") || blog.tags?.join(", "),
    canonicalUrl: blog.seo?.canonicalUrl || `${SITE_URL}/blogs/${blog.slug}`,
    imageUrl: sanitizeOgImageUrl(blog.ogImage || blog.featuredImage),
    type: "article",
    authorName: blog.author?.name || "Global Chanakya Editorial",
    publishedTime: blog.publishAt ? new Date(blog.publishAt).toISOString() : undefined,
    modifiedTime: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
    robots: blog.seo?.robots,
    category: blog.category,
  });
}

function sanitizeBlogContent(html: string): string {
  let clean = html || "";
  
  // Handle double-escaped HTML tags
  if (clean.includes("&lt;")) {
    clean = clean
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
  }

  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  clean = clean.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, "");
  clean = clean.replace(/\s+on\w+\s*=\s*'[^']*'/gi, "");
  return clean;
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const blog = await getBlogData(decodedSlug);
  if (!blog) notFound();

  // Defer auth check until after blog is loaded from cache
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  
  // Security check: if not published and not admin, return 404
  if (blog.status !== "published" && !isAdmin) {
    notFound();
  }

  // Get related blogs from cache
  const relatedBlogs = await getCachedRelatedBlogs(blog._id.toString(), blog.category);

  const readTime = Math.max(1, calculateReadingTime(blog.content.replace(/<[^>]*>/g, "")));
  const publishDate = formatDate(blog.publishAt, "long");

  let sanitizedContent = sanitizeBlogContent(blog.content);

  let tocIndex = 0;
  const toc: { id: string, level: string, text: string }[] = [];
  sanitizedContent = sanitizedContent.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
    const id = `toc-${tocIndex++}`;
    const cleanText = text.replace(/<[^>]+>/g, '');
    toc.push({ id, level, text: cleanText });
    return `<h${level} id="${id}"${attrs} style="scroll-margin-top: 100px;">${text}</h${level}>`;
  });

  const jsonLd = generateBlogJsonLd(blog);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogClientTracker 
        title={blog.title} 
        category={blog.category} 
        author={blog.author?.name || "Global Chanakya Editorial"} 
        slug={blog.slug}
        isLoggedIn={!!session}
      />
      <ReadingProgress />

      {/* Hero Header */}
      <header className="relative pt-32 pb-12 border-b border-[var(--border)] strategic-grid bg-[var(--surface)]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg)] pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-6 md:px-8 relative z-10">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-[var(--secondary)] text-[12px] font-bold uppercase tracking-widest hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Intel Desk
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1.5 rounded-sm intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-widest">
              {blog.category}
            </span>
            {blog.isTrending && (
              <span className="px-3 py-1.5 rounded-sm bg-[var(--blue)]/10 border border-[var(--blue)]/20 text-[var(--blue)] text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Trending Report
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-[-0.02em] text-white mb-6 max-w-4xl">
            {blog.title}
          </h1>

          <p className="text-[18px] md:text-[20px] leading-[1.8] text-[var(--secondary)] max-w-3xl border-l-2 border-[var(--gold)] pl-5 font-medium">
            {blog.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-[var(--border)] text-[12px] font-bold uppercase tracking-widest text-[var(--muted)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] intel-border flex items-center justify-center text-[14px] text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                {(blog.author?.name || "G")[0].toUpperCase()}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white">{blog.author?.name || "Global Chanakya Editorial"}</span>
                <span className="text-[10px] text-[var(--gold)]">Lead Analyst</span>
              </div>
            </div>
            <div className="w-px h-8 bg-[var(--border)] hidden sm:block"></div>
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--secondary)]" /> {publishDate}</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[var(--secondary)]" /> {readTime} min read</span>
            <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-[var(--secondary)]" /> <span className="blog-view-count">{formatViews(blog.analytics?.views || 0)}</span> views</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Main Content */}
          <article className="xl:col-span-8 w-full max-w-4xl mx-auto xl:mx-0">
            {blog.featuredImage && (
              <div className="mb-12 aspect-video w-full rounded-sm overflow-hidden intel-border relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image src={blog.featuredImage} alt={blog.seo?.title || blog.title || "Global Chanakya"} width={1200} height={675} priority={true} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Ad: After featured image */}
            <InArticleAd slot="auto" />

            <div 
              className="article-body" 
              dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
            />

            {/* Ad: After article content */}
            <InArticleAd slot="auto" />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-wrap gap-3">
                <div className="w-full flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--secondary)] mb-2">
                  <Tag className="w-3.5 h-3.5" /> Tracked Topics
                </div>
                {blog.tags.map((tag: string) => (
                  <Link key={tag} href={`/blogs?tag=${encodeURIComponent(tag)}`} className="px-4 py-2 rounded-sm intel-border bg-[var(--surface)] text-[var(--secondary)] text-[12px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
            
            <BlogActions
              slug={blog.slug}
              initialLikes={blog.analytics?.likes || 0}
              initialBookmarks={blog.analytics?.bookmarks || 0}
              isLoggedIn={!!session}
              commentsEnabled={blog.commentsEnabled !== false}
            />

            {/* Bottom Suggestions / Related Blogs */}
            {relatedBlogs.length > 0 && (
              <div className="mt-16 pt-12 border-t border-[var(--border)]">
                <h3 className="text-[18px] font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-8">
                  <Newspaper className="w-5 h-5 text-[var(--cyan)]" /> Suggested Intelligence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedBlogs.map((rb: any) => (
                    <Link key={rb._id} href={`/blogs/${rb.slug}`} className="glass-card p-5 rounded-sm hover:-translate-y-1 transition-transform group flex flex-col gap-3 border border-[var(--border)] hover:border-[var(--gold)]/50">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cyan)]">{rb.category}</span>
                      <h4 className="text-[16px] font-bold text-white leading-snug group-hover:text-[var(--gold)] transition-colors line-clamp-2">
                        {rb.title}
                      </h4>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2 mt-auto pt-2">
                        <Clock className="w-3.5 h-3.5" /> {formatDate(rb.publishAt, "short")}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="xl:col-span-4 sticky top-32 max-h-[calc(100vh-128px)] overflow-y-auto custom-scrollbar flex-col gap-8 hidden xl:flex pb-8 pr-4">
            {/* TOC */}
            {toc.length > 0 && (
              <div className="glass-card rounded-sm p-6 shrink-0">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
                  <Crosshair className="w-4 h-4 text-[var(--gold)]" /> Executive Summary
                </h3>
                <nav className="flex flex-col gap-3">
                  {toc.map((item) => (
                    <a 
                      key={item.id} 
                      href={`#${item.id}`} 
                      className={`text-[13px] leading-[1.6] font-medium transition-colors hover:text-[var(--gold)] ${item.level === "3" ? "ml-4 text-[var(--muted)]" : "text-[var(--secondary)]"}`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Related Reports */}
            {relatedBlogs.length > 0 && (
              <div className="glass-card rounded-sm p-6 shrink-0">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
                  <Newspaper className="w-4 h-4 text-[var(--cyan)]" /> Related Intelligence
                </h3>
                <div className="flex flex-col gap-5">
                  {relatedBlogs.map((rb: any) => (
                    <Link key={rb._id} href={`/blogs/${rb.slug}`} className="group flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cyan)]">{rb.category}</span>
                      <h4 className="text-[14px] font-bold text-white leading-snug group-hover:text-[var(--gold)] transition-colors line-clamp-2">
                        {rb.title}
                      </h4>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" /> {formatDate(rb.publishAt, "short")}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Ad: Sidebar ad unit */}
            <SidebarAd slot="auto" />
          </aside>

        </div>
      </div>

      <style>{`
        .article-body {
          font-size: 18px;
          line-height: 1.85;
          color: var(--secondary);
          font-family: var(--font-inter), sans-serif;
        }
        .article-body p { margin-bottom: 1.6em; color: var(--text); }
        .article-body h2 { 
          font-size: 1.8em; 
          font-weight: 800; 
          color: white !important; 
          margin-top: 2em; 
          margin-bottom: 1em; 
          border-bottom: 1px solid var(--border); 
          padding-bottom: 0.5em; 
        }
        .article-body h3 { font-size: 1.4em; font-weight: 700; color: white !important; margin-top: 1.8em; margin-bottom: 0.8em; }
        .article-body a { color: var(--gold) !important; text-decoration: none; border-bottom: 1px solid var(--gold); transition: all 0.2s; }
        .article-body a:hover { opacity: 0.8; }
        .article-body blockquote {
          margin: 2em 0;
          padding: 24px;
          border-left: 3px solid var(--gold);
          background: var(--surface) !important;
          color: var(--secondary) !important;
          font-style: italic;
          font-size: 1.1em;
          border-radius: 0 4px 4px 0;
        }
        .article-body blockquote p { color: var(--secondary) !important; margin: 0; }
        .article-body ul, .article-body ol { margin: 1.5em 0; padding-left: 2em; }
        .article-body li { margin-bottom: 0.5em; }
        .article-body ul li::marker { color: var(--gold); }
        .article-body img { width: 100%; border-radius: 4px; margin: 2em 0; border: 1px solid var(--border); }
        .article-body pre { background: var(--surface) !important; padding: 20px; border-radius: 4px; border: 1px solid var(--border); overflow-x: auto; }
        .article-body code { font-family: monospace; color: var(--cyan) !important; }
      `}</style>
    </div>
  );
}
