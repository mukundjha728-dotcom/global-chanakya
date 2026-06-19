import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { auth } from "@/auth";
import PremiumLock from "@/components/blogs/PremiumLock";
import BlogActions from "@/components/blogs/BlogActions";
import { generateSeoMetadata, calculateReadingTime, formatDate } from "@repo/utils";
import { ArrowLeft, Clock, Eye, Calendar, Tag, Share2, Crown, TrendingUp } from "lucide-react";
import { SITE_URL } from "@/constants";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const blog = await Blog.findOne({ slug, status: "published" }).lean() as any;
  if (!blog) return { title: "Not Found" };
  return generateSeoMetadata({
    title: blog.seo?.title || blog.title,
    description: blog.seo?.description || blog.excerpt,
    keywords: blog.seo?.keywords || blog.tags?.join(", "),
    canonicalUrl: `${SITE_URL}/blogs/${blog.slug}`,
    imageUrl: blog.featuredImage,
    type: "article",
  });
}

/**
 * Sanitize blog HTML content:
 * - Remove <style> tags to prevent style leaking
 * - Remove <script> tags for security
 * - Strip class attributes that might conflict with Tailwind
 * - Convert inline styles to be safe
 */
function sanitizeBlogContent(html: string): string {
  let clean = html;

  // Remove <script> tags completely
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove <style> tags completely (prevents style leaking)
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove any on* event handlers (onclick, onerror, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, "");
  clean = clean.replace(/\s+on\w+\s*=\s*'[^']*'/gi, "");

  return clean;
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const session = await auth();

  const blog = await Blog.findOne({ slug, status: "published" }).populate("author", "name").lean() as any;
  if (!blog) notFound();

  const readTime = Math.max(1, calculateReadingTime(blog.content.replace(/<[^>]*>/g, "")));
  const publishDate = formatDate(blog.publishAt, "long");

  const sanitizedContent = sanitizeBlogContent(blog.content);

  return (
    <div className="min-h-screen bg-[#080808]" style={{ color: "#e5e7eb" }}>

      {/* Top gradient accent */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "2px", zIndex: 50,
        background: "linear-gradient(90deg, #f59e0b, #ef4444, #8b5cf6)",
      }} />

      {/* Hero section with gradient */}
      <div style={{
        background: "linear-gradient(180deg, rgba(15,15,20,1) 0%, rgba(8,8,8,1) 100%)",
        paddingTop: "100px", paddingBottom: "60px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>

          {/* Back nav */}
          <Link href="/blogs" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            color: "#6b7280", fontSize: "13px", marginBottom: "32px",
            textDecoration: "none", transition: "color 0.2s",
          }}
            className="hover:text-white group"
          >
            <ArrowLeft style={{ width: "15px", height: "15px" }} />
            Back to Latest Intel
          </Link>

          {/* Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            <span style={{
              padding: "4px 12px", borderRadius: "999px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#9ca3af", fontSize: "11px", fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              {blog.category}
            </span>
            {blog.visibility === "premium" && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                padding: "4px 12px", borderRadius: "999px",
                background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                color: "#fbbf24", fontSize: "11px", fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                <Crown style={{ width: "12px", height: "12px" }} /> Premium
              </span>
            )}
            {blog.isTrending && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                padding: "4px 12px", borderRadius: "999px",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171", fontSize: "11px", fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                <TrendingUp style={{ width: "12px", height: "12px" }} /> Trending
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 800,
            lineHeight: 1.15, letterSpacing: "-0.02em",
            color: "#ffffff", marginBottom: "20px",
          }}>
            {blog.title}
          </h1>

          {/* Excerpt */}
          <p style={{
            fontSize: "18px", lineHeight: 1.7, color: "#9ca3af",
            marginBottom: "28px", paddingLeft: "16px",
            borderLeft: "3px solid rgba(239,68,68,0.5)",
          }}>
            {blog.excerpt}
          </p>

          {/* Meta row */}
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            gap: "20px", paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "linear-gradient(135deg, #ef4444, #f59e0b)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>
                {(blog.author?.name || "G")[0].toUpperCase()}
              </div>
              <div>
                <p style={{ color: "#e5e7eb", fontSize: "14px", fontWeight: 600, margin: 0 }}>
                  {blog.author?.name || "Global Chanakya Editorial"}
                </p>
                <p style={{ color: "#6b7280", fontSize: "12px", margin: 0 }}>Author</p>
              </div>
            </div>

            <div style={{ width: "1px", height: "32px", background: "rgba(255,255,255,0.08)" }} />

            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px" }}>
              <Calendar style={{ width: "14px", height: "14px" }} />
              {publishDate}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px" }}>
              <Clock style={{ width: "14px", height: "14px" }} />
              {readTime} min read
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px" }}>
              <Eye style={{ width: "14px", height: "14px" }} />
              {(blog.analytics?.views || 0).toLocaleString()} views
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {blog.featuredImage && (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.featuredImage}
            alt={blog.title}
            style={{
              width: "100%", borderRadius: "16px", marginTop: "-1px",
              objectFit: "cover", maxHeight: "500px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
        </div>
      )}

      {/* Article body */}
      <div style={{ maxWidth: "740px", margin: "0 auto", padding: "48px 24px 120px" }}>
        <PremiumLock
          earlyAccessUntil={blog.earlyAccessUntil}
          userRole={(session?.user as any)?.role}
          isLoggedIn={!!session}
          blogSlug={blog.slug}
        >
          {/* Article content — sanitized and scoped */}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </PremiumLock>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div style={{ marginTop: "56px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Tag style={{ width: "14px", height: "14px", color: "#6b7280" }} />
              <span style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                Topics
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {blog.tags.map((tag: string) => (
                <Link key={tag} href={`/blogs?tag=${encodeURIComponent(tag)}`} style={{
                  padding: "6px 14px", borderRadius: "999px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#9ca3af", fontSize: "13px", textDecoration: "none",
                  transition: "all 0.2s",
                }}
                  className="hover:text-white hover:border-white/20"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div style={{
          marginTop: "64px", padding: "32px",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px", textAlign: "center",
        }}>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "16px" }}>
            More intelligence from Global Chanakya
          </p>
          <Link href="/blogs" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "10px 24px", borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#e5e7eb", fontSize: "14px", textDecoration: "none",
            transition: "all 0.2s",
          }}
            className="hover:bg-white/5 hover:border-white/20"
          >
            <ArrowLeft style={{ width: "15px", height: "15px" }} />
            View All Reports
          </Link>
        </div>
      </div>

      {/* ── Blog Actions (Like, Comment, Bookmark, Share) ── */}
      <BlogActions
        slug={blog.slug}
        initialLikes={blog.analytics?.likes || 0}
        initialBookmarks={blog.analytics?.bookmarks || 0}
        isLoggedIn={!!session}
        commentsEnabled={blog.commentsEnabled !== false}
      />

      {/* Global article body styles — comprehensive reset to handle any HTML/CSS from editor */}
      <style>{`
        .article-body {
          font-size: 17px;
          line-height: 1.85;
          color: #d1d5db;
          font-family: Georgia, 'Times New Roman', serif;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
        }

        /* ── RESET: Normalize all elements inside article-body ── */
        .article-body * {
          max-width: 100%;
          box-sizing: border-box;
        }

        .article-body p {
          margin-bottom: 1.5em;
          margin-top: 0;
          color: #d1d5db;
          font-size: inherit;
          line-height: inherit;
        }

        /* Empty paragraphs from TipTap — collapse them */
        .article-body p:empty,
        .article-body p br:only-child {
          margin-bottom: 0.5em;
        }

        .article-body h1, .article-body h2, .article-body h3, .article-body h4, .article-body h5, .article-body h6 {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #ffffff !important;
          font-weight: 700;
          line-height: 1.3;
          margin-top: 2em;
          margin-bottom: 0.75em;
          letter-spacing: -0.01em;
          background: none !important;
          -webkit-text-fill-color: #ffffff !important;
        }
        .article-body h1 { font-size: 2em; }
        .article-body h2 { font-size: 1.5em; border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 0.4em; }
        .article-body h3 { font-size: 1.25em; }
        .article-body h4 { font-size: 1.1em; }
        .article-body h5 { font-size: 1em; }
        .article-body h6 { font-size: 0.95em; color: #9ca3af !important; -webkit-text-fill-color: #9ca3af !important; }

        .article-body a { color: #f87171 !important; text-decoration: none; border-bottom: 1px solid rgba(248,113,113,0.3); }
        .article-body a:hover { color: #fca5a5 !important; border-bottom-color: #fca5a5; }

        .article-body strong, .article-body b { color: #ffffff !important; font-weight: 700; }
        .article-body em, .article-body i { color: #e5e7eb; font-style: italic; }

        .article-body blockquote {
          margin: 2em 0;
          padding: 20px 24px;
          border-left: 4px solid #ef4444;
          background: rgba(239,68,68,0.05) !important;
          border-radius: 0 12px 12px 0;
          color: #9ca3af !important;
          font-style: italic;
          font-size: 1.05em;
        }
        .article-body blockquote * { color: #9ca3af !important; }
        .article-body blockquote p { margin-bottom: 0; color: #9ca3af !important; }

        .article-body ul, .article-body ol {
          margin: 1.5em 0;
          padding-left: 1.75em;
          color: #d1d5db;
        }
        .article-body li {
          margin-bottom: 0.6em;
          color: #d1d5db;
        }
        .article-body ul li::marker { color: #ef4444; }
        .article-body ol li::marker { color: #ef4444; font-weight: 700; }

        /* Nested lists */
        .article-body li > ul,
        .article-body li > ol {
          margin-top: 0.4em;
          margin-bottom: 0.4em;
        }

        .article-body code {
          background: rgba(255,255,255,0.07) !important;
          color: #fca5a5 !important;
          padding: 2px 7px;
          border-radius: 5px;
          font-size: 0.9em;
          font-family: 'Fira Code', 'Consolas', monospace;
        }
        .article-body pre {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 20px;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .article-body pre code {
          background: transparent !important;
          padding: 0;
          color: #d1d5db !important;
          font-size: 0.9em;
        }

        .article-body hr {
          border: none;
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 2.5em 0;
        }

        .article-body img {
          width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 2em 0;
          border: 1px solid rgba(255,255,255,0.08);
          display: block;
        }

        .article-body figure {
          margin: 2em 0;
          padding: 0;
        }
        .article-body figcaption {
          text-align: center;
          color: #6b7280;
          font-size: 0.85em;
          margin-top: 8px;
          font-style: italic;
        }

        .article-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 2em 0;
          font-size: 0.95em;
          overflow-x: auto;
          display: block;
        }
        .article-body th {
          background: rgba(255,255,255,0.05) !important;
          color: #e5e7eb !important;
          padding: 10px 14px;
          text-align: left;
          border: 1px solid rgba(255,255,255,0.1);
          font-weight: 600;
        }
        .article-body td {
          padding: 10px 14px;
          border: 1px solid rgba(255,255,255,0.07);
          color: #d1d5db !important;
          background: transparent !important;
        }
        .article-body tr:hover td { background: rgba(255,255,255,0.02) !important; }

        /* ── Handle TipTap specific elements ── */
        .article-body .ProseMirror { outline: none; }

        /* TipTap text alignment */
        .article-body [style*="text-align: center"] { text-align: center; }
        .article-body [style*="text-align: right"] { text-align: right; }
        .article-body [style*="text-align: justify"] { text-align: justify; }

        /* Force dark-mode compatible colors on all inline-styled elements */
        .article-body [style*="color: rgb(0, 0, 0)"],
        .article-body [style*="color: black"],
        .article-body [style*="color:#000"],
        .article-body [style*="color: #000000"] {
          color: #d1d5db !important;
        }

        .article-body [style*="background-color: rgb(255, 255, 255)"],
        .article-body [style*="background-color: white"],
        .article-body [style*="background:#fff"],
        .article-body [style*="background-color: #ffffff"] {
          background-color: transparent !important;
        }

        /* Force override any bright backgrounds */
        .article-body div[style*="background"],
        .article-body span[style*="background"],
        .article-body p[style*="background"] {
          background-color: transparent !important;
          background: transparent !important;
        }

        /* Override text colors that would be unreadable on dark bg */
        .article-body [style*="color: rgb(0,"],
        .article-body [style*="color: rgb(1,"],
        .article-body [style*="color: rgb(2,"],
        .article-body [style*="color: rgb(3,"],
        .article-body [style*="color: rgb(4,"],
        .article-body [style*="color: rgb(5,"] {
          color: #d1d5db !important;
        }

        /* Handle iframes (embedded videos) */
        .article-body iframe {
          width: 100%;
          max-width: 100%;
          border-radius: 12px;
          margin: 2em 0;
          aspect-ratio: 16 / 9;
          border: 1px solid rgba(255,255,255,0.08);
        }

        /* Handle embedded divs that might have their own styling */
        .article-body > div {
          background: transparent !important;
          color: inherit !important;
        }

        /* Mark/highlight */
        .article-body mark {
          background: rgba(245,158,11,0.2) !important;
          color: #fbbf24 !important;
          padding: 1px 4px;
          border-radius: 3px;
        }

        /* Sup / Sub */
        .article-body sup { color: #9ca3af; font-size: 0.75em; }
        .article-body sub { color: #9ca3af; font-size: 0.75em; }

        /* Details / Summary */
        .article-body details {
          margin: 1.5em 0;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02) !important;
        }
        .article-body summary {
          color: #e5e7eb;
          font-weight: 600;
          cursor: pointer;
        }

        /* Horizontal scrolling for wide content */
        .article-body .table-wrapper,
        .article-body .tableWrapper {
          overflow-x: auto;
          margin: 2em 0;
        }
      `}</style>
    </div>
  );
}
