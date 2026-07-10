import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calendar, Tag, ArrowLeft } from "lucide-react";
import { SEO_BLOGS, PlatformSeoBlog } from "@/constants/platformSeoBlogs";
import ReactMarkdown from "react-markdown";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static routes at build time
export async function generateStaticParams() {
  return SEO_BLOGS.map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = SEO_BLOGS.find((b) => b.slug === resolvedParams.slug);
  
  if (!blog) {
    return {
      title: "Not Found | Global Chanakya",
    };
  }

  return {
    title: `${blog.title} | Global Chanakya Strategic Intelligence`,
    description: blog.excerpt,
    keywords: blog.keywords.join(", "),
    alternates: {
      canonical: `https://www.globalchanakya.in/platformseo/${blog.slug}`,
    },
    robots: "index, follow",
  };
}

export default async function PlatformSeoArticle({ params }: Props) {
  const resolvedParams = await params;
  const blog = SEO_BLOGS.find((b) => b.slug === resolvedParams.slug);

  if (!blog) {
    notFound();
  }

  // Find related posts (exclude current, match category)
  const relatedPosts = SEO_BLOGS
    .filter((b) => b.category === blog.category && b.slug !== blog.slug)
    .slice(0, 3);

  // If not enough related in category, grab recent ones
  if (relatedPosts.length < 3) {
    const filler = SEO_BLOGS.filter(b => b.slug !== blog.slug && !relatedPosts.includes(b));
    relatedPosts.push(...filler.slice(0, 3 - relatedPosts.length));
  }

  // Construct JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": blog.title,
        "description": blog.excerpt,
        "datePublished": blog.publishedAt,
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
              {new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </article>

        {/* Meta / Keywords */}
        <div className="py-8 border-y border-[var(--border)] mb-20">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-[var(--gold)]" />
            <span className="text-sm font-bold uppercase tracking-wider text-white">Keywords:</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {blog.keywords.map((kw) => (
              <span key={kw} className="px-3 py-1 bg-[var(--surface)] rounded-full text-xs font-medium text-[var(--muted)]">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Related Posts */}
        <div className="pt-10">
          <h3 className="text-2xl font-bold text-white mb-8 border-l-4 border-[var(--gold)] pl-4">Related Intelligence</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((rp) => (
              <Link href={`/platformseo/${rp.slug}`} key={rp.slug} className="group glass-card p-5 rounded-xl border border-[var(--border)] hover:border-[var(--gold)]/40 transition-all">
                <span className="block text-[10px] uppercase tracking-wider text-[var(--cyan)] mb-2">{rp.category}</span>
                <h4 className="text-sm font-bold text-white leading-[1.4] group-hover:text-[var(--gold)] transition-colors line-clamp-3">
                  {rp.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
