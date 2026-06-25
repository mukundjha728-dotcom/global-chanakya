import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const maxDuration = 30;

function errorMsg(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

// Simple rule-based SEO optimizer (no external AI API needed)
function optimizeSEO(data: any): Partial<any> {
  const title: string = data.title || data.name || "";
  const rawContent: string = (data.content || data.overview || data.summary || data.description || data.excerpt || "")
    .replace(/<[^>]+>/g, " ")  // strip HTML
    .replace(/\s+/g, " ")
    .trim();
  const excerpt: string = data.excerpt || data.summary || "";
  const tags: string[] = Array.isArray(data.tags) ? data.tags : [];
  const category: string = data.category || data.type || "";

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

  // ── Keywords: from tags + title words ────────────────────────────────────
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);
  const keywords = [...new Set([...tags.map((t) => (typeof t === "string" ? t.toLowerCase() : String(t).toLowerCase())), ...titleWords])].slice(0, 10);

  // ── AI Summary (llms.txt) ─────────────────────────────────────────────────
  // 2-3 sentence structured summary for LLM ingestion
  const sentences = rawContent
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40)
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
  const schemaMarkup = JSON.stringify({
    "@context": "https://schema.org",
    "@type": category === "Op-Ed" ? "OpinionNewsArticle" : "NewsArticle",
    "headline": seoTitle,
    "description": seoDescription,
    "keywords": keywords.join(", "),
    "publisher": {
      "@type": "Organization",
      "name": "Global Chanakya",
      "url": "https://globalchanakya.com",
    },
    ...(safePublishDate ? { "datePublished": safePublishDate } : {}),
    ...(safeUpdateDate ? { "dateModified": safeUpdateDate } : {}),
    ...(data.featuredImage ? { "image": data.featuredImage } : {}),
  }, null, 2);

  return {
    seo: {
      title: seoTitle,
      description: seoDescription,
      keywords,
      schemaMarkup,
    },
    aiSummary,
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
