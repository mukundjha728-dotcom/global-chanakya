import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Tag, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";

export const revalidate = 300;

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

async function getPlatformSeoBlog(slug: string) {
  await dbConnect();
  const blog = await Blog.findOne(
    { slug, contentType: "platform-seo", status: "published" },
    { title: 1, slug: 1, excerpt: 1, content: 1, markdown: 1, category: 1, publishAt: 1, seo: 1 }
  ).lean();
  return blog ? JSON.parse(JSON.stringify(blog)) : null;
}

async function getRelatedPosts(category: string, excludeSlug: string) {
  await dbConnect();
  const posts = await Blog.find(
    { contentType: "platform-seo", status: "published", category, slug: { $ne: excludeSlug } },
    { title: 1, slug: 1, category: 1 }
  )
    .sort({ publishAt: -1 })
    .limit(3)
    .lean();

  // If not enough, fill with any platform-seo posts
  if (posts.length < 3) {
    const existingSlugs = [excludeSlug, ...posts.map(p => p.slug)];
    const filler = await Blog.find(
      { contentType: "platform-seo", status: "published", slug: { $nin: existingSlugs } },
      { title: 1, slug: 1, category: 1 }
    )
      .sort({ publishAt: -1 })
      .limit(3 - posts.length)
      .lean();
    posts.push(...filler);
  }

  return JSON.parse(JSON.stringify(posts));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await getPlatformSeoBlog(resolvedParams.slug);

  if (!blog) {
    return { title: "Not Found | Global Chanakya" };
  }

  const canonicalUrl = `https://www.globalchanakya.in/platformseo/${blog.slug}`;

  return {
    title: `${blog.title} | Global Chanakya Strategic Intelligence`,
    description: blog.excerpt,
    keywords: blog.seo?.keywords?.join(", ") || "",
    alternates: {
      canonical: canonicalUrl,
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: canonicalUrl,
      siteName: "Global Chanakya",
      locale: "en_US",
      type: "article",
      publishedTime: new Date(blog.publishAt).toISOString(),
      authors: ["Global Chanakya Intelligence"],
      images: [{
        url: "https://www.globalchanakya.in/og-image.png",
        width: 1200,
        height: 630,
        alt: blog.title,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      creator: "@globalchanakya",
      site: "@globalchanakya",
      images: ["https://www.globalchanakya.in/og-image.png"],
    },
  };
}

export default async function PlatformSeoArticle({ params }: Props) {
  const resolvedParams = await params;
  const blog = await getPlatformSeoBlog(resolvedParams.slug);

  if (!blog) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(blog.category, blog.slug);

  // Use markdown field if available, otherwise fall back to content
  const articleContent = blog.markdown || blog.content;

  // Construct JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": blog.title,
        "description": blog.excerpt,
        "datePublished": blog.publishAt,
        "author": {
          "@type": "Organization",
          "name": "Global Chanakya Intelligence"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Global Chanakya",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.globalchanakya.in/icon.svg"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://www.globalchanakya.in/platformseo/${blog.slug}`
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.globalchanakya.in/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Platform SEO",
            "item": "https://www.globalchanakya.in/platformseo"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": blog.title,
            "item": `https://www.globalchanakya.in/platformseo/${blog.slug}`
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-32 pb-20">
      {/* JSON-LD Script Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-6">
        
        <Link href="/platformseo" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)] hover:text-white transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Intelligence Hub
        </Link>

        {/* Article Header */}
        <header className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--cyan)]">
              {blog.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(blog.publishAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-[1.15] tracking-[-0.02em] mb-6">
            {blog.title}
          </h1>
          <p className="text-xl text-[var(--muted)] leading-[1.6]">
            {blog.excerpt}
          </p>
        </header>

        {/* Article Content */}
        <article className="prose prose-invert prose-lg max-w-none mb-20 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--gold)] hover:prose-a:text-[var(--gold)]/80 prose-strong:text-white">
          <ReactMarkdown>{articleContent}</ReactMarkdown>
        </article>

        {/* Meta / Keywords */}
        {blog.seo?.keywords && blog.seo.keywords.length > 0 && (
          <div className="py-8 border-y border-[var(--border)] mb-20">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-[var(--gold)]" />
              <span className="text-sm font-bold uppercase tracking-wider text-white">Keywords:</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {blog.seo.keywords.map((kw: string) => (
                <span key={kw} className="px-3 py-1 bg-[var(--surface)] rounded-full text-xs font-medium text-[var(--muted)]">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="pt-10">
            <h3 className="text-2xl font-bold text-white mb-8 border-l-4 border-[var(--gold)] pl-4">Related Intelligence</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((rp: any) => (
                <Link href={`/platformseo/${rp.slug}`} key={rp._id} className="group glass-card p-5 rounded-xl border border-[var(--border)] hover:border-[var(--gold)]/40 transition-all">
                  <span className="block text-[10px] uppercase tracking-wider text-[var(--cyan)] mb-2">{rp.category}</span>
                  <h4 className="text-sm font-bold text-white leading-[1.4] group-hover:text-[var(--gold)] transition-colors line-clamp-3">
                    {rp.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
