import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const maxDuration = 30;

function errorMsg(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

// Production-grade rule-based SEO optimizer (no external AI API needed)
function optimizeSEO(data: any): Partial<any> {
  const title: string = data.title || data.name || "";
  const rawContent: string = (data.content || data.overview || data.summary || data.description || data.excerpt || "")
    .replace(/<[^>]+>/g, " ")  // strip HTML
    .replace(/\s+/g, " ")
    .trim();
  const excerpt: string = data.excerpt || data.summary || "";
  const tags: string[] = Array.isArray(data.tags) ? data.tags : [];
  const category: string = data.category || data.type || "";
  const slug: string = data.slug || "";
  const existingFocusKeyword: string = data.seo?.focusKeyword || "";

  // ── SEO Title: 50-60 chars, keyword-rich ─────────────────────────────────
  let seoTitle = "";
  if (title.length >= 30 && title.length <= 60) {
    seoTitle = title;
  } else if (title.length > 60) {
    // Truncate at last word boundary before 60
    seoTitle = title.slice(0, 57).replace(/\s+\S*$/, "") + "...";
  } else {
    // Too short — append context
    const ctx = category ? ` | ${category}` : " | Global Chanakya";
    seoTitle = (title + ctx).slice(0, 60);
  }

  // ── Meta Description: 120-160 chars ─────────────────────────────────────
  let seoDescription = "";
  const descBase = excerpt || rawContent;
  if (descBase.length >= 120 && descBase.length <= 160) {
    seoDescription = descBase;
  } else if (descBase.length > 160) {
    seoDescription = descBase.slice(0, 157).replace(/\s+\S*$/, "") + "...";
  } else if (descBase.length > 0) {
    // Pad with context
    const suffix = ` Read the full analysis on Global Chanakya — the geopolitical intelligence platform.`;
    seoDescription = (descBase + suffix).slice(0, 160);
  } else {
    seoDescription = `${seoTitle} — Expert geopolitical analysis and intelligence briefing on Global Chanakya.`.slice(0, 160);
  }

  // ── Focus Keyword: Extract from title if not set ────────────────────────
  let focusKeyword = existingFocusKeyword;
  if (!focusKeyword) {
    // Extract 2-3 word phrase from title (skip common words)
    const stopWords = new Set(["the", "and", "for", "from", "with", "this", "that", "are", "was", "has", "its", "how", "why", "what"]);
    const titleWords = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w: string) => w.length > 2 && !stopWords.has(w));
    focusKeyword = titleWords.slice(0, 3).join(" ");
  }

  // ── Keywords: from tags + title words ────────────────────────────────────
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter((w: string) => w.length > 3)
    .slice(0, 5);
  const keywords = [...new Set([
    ...(focusKeyword ? [focusKeyword] : []),
    ...tags.map((t) => (typeof t === "string" ? t.toLowerCase() : String(t).toLowerCase())),
    ...titleWords,
  ])].slice(0, 10);

  // ── Canonical URL ──────────────────────────────────────────────────────────
  let canonicalUrl = data.seo?.canonicalUrl || "";
  if (!canonicalUrl && slug) {
    canonicalUrl = `https://www.globalchanakya.in/blogs/${slug}`;
  }

  // ── AI Summary (llms.txt) ─────────────────────────────────────────────────
  // 2-3 sentence structured summary for LLM ingestion
  const sentences = rawContent
    .split(/[.!?]+/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 40)
    .slice(0, 3);

  let aiSummary = "";
  if (sentences.length >= 2) {
    aiSummary = sentences.join(". ").trim() + ".";
  } else if (excerpt) {
    aiSummary = excerpt;
  } else {
    aiSummary = `${seoTitle}: ${seoDescription}`;
  }
  // Cap at 300 chars
  if (aiSummary.length > 300) {
    aiSummary = aiSummary.slice(0, 297) + "...";
  }

  const getSafeIso = (d: any) => {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt.toISOString();
  };

  const safePublishDate = getSafeIso(data.publishAt);
  const safeUpdateDate = getSafeIso(data.updatedAt);

  // ── Schema Markup (JSON-LD) ───────────────────────────────────────────────
  const schemaGraph: any[] = [];

  // Main article schema
  const articleType = category === "Op-Ed" ? "OpinionNewsArticle" : "NewsArticle";
  schemaGraph.push({
    "@type": articleType,
    "headline": seoTitle,
    "description": seoDescription,
    "keywords": keywords.join(", "),
    "publisher": {
      "@type": "Organization",
      "name": "Global Chanakya",
      "url": "https://www.globalchanakya.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.globalchanakya.in/brand/logo.svg"
      }
    },
    ...(safePublishDate ? { "datePublished": safePublishDate } : {}),
    ...(safeUpdateDate ? { "dateModified": safeUpdateDate } : {}),
    ...(data.featuredImage ? { "image": data.featuredImage } : {}),
    ...(canonicalUrl ? { "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl } } : {}),
  });

  // BreadcrumbList
  schemaGraph.push({
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.globalchanakya.in/" },
      { "@type": "ListItem", "position": 2, "name": "Reports", "item": "https://www.globalchanakya.in/blogs" },
      ...(category ? [{ "@type": "ListItem", "position": 3, "name": category, "item": `https://www.globalchanakya.in/blogs?category=${encodeURIComponent(category)}` }] : []),
      ...(slug ? [{ "@type": "ListItem", "position": category ? 4 : 3, "name": seoTitle, "item": canonicalUrl }] : []),
    ]
  });

  // FAQPage schema if FAQs exist
  if (Array.isArray(data.faq) && data.faq.length > 0) {
    const validFaqs = data.faq.filter((f: any) => f.question && f.answer);
    if (validFaqs.length > 0) {
      schemaGraph.push({
        "@type": "FAQPage",
        "mainEntity": validFaqs.map((f: any) => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": { "@type": "Answer", "text": f.answer }
        }))
      });
    }
  }

  const schemaMarkup = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": schemaGraph,
  }, null, 2);

  return {
    seo: {
      focusKeyword,
      title: seoTitle,
      description: seoDescription,
      keywords,
      canonicalUrl,
      robots: data.seo?.robots || "index,follow",
      schemaMarkup,
    },
    aiSummary,
    // Suggest ogImage = featuredImage if not set
    ...(data.featuredImage && !data.ogImage ? { ogImage: data.featuredImage } : {}),
  };
}

export async function POST(req: NextRequest) {
  try {
    const [session] = await Promise.all([auth()]);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== "admin" && userRole !== "super_admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const result = optimizeSEO(body);
    return NextResponse.json({ success: true, optimized: result });
  } catch (err) {
    console.error("[POST /api/admin/seo-optimize]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}
