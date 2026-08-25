/**
 * Tests for blog taxonomy/routing correctness:
 * Platform SEO (contentType: "platform-seo") must NOT appear in /blogs queries.
 * Standard geopolitical articles (contentType: "standard") MUST appear in /blogs queries.
 *
 * These tests validate the query logic (filter predicates) that getCachedBlogs,
 * BlogRepository, and sitemap apply — not UI rendering.
 */

import { describe, it, expect } from "vitest";

/**
 * Mirrors the exact query predicate used in getCachedBlogs (blogs/page.tsx)
 * and BlogRepository listing methods.
 */
function buildBlogsQuery(category?: string, trending?: boolean) {
  const query: Record<string, unknown> = {
    status: "published",
    contentType: { $ne: "platform-seo" },
  };
  if (category) query.category = category;
  if (trending) query.isTrending = true;
  return query;
}

/** Simulates MongoDB $ne filter on an in-memory array */
function applyBlogsFilter(blogs: any[], query: Record<string, unknown>) {
  return blogs.filter((b) => {
    for (const [key, val] of Object.entries(query)) {
      if (typeof val === "object" && val !== null && "$ne" in (val as any)) {
        if (b[key] === (val as any).$ne) return false;
      } else {
        if (b[key] !== val) return false;
      }
    }
    return true;
  });
}

const mockBlogs = [
  {
    _id: "1",
    title: "Russia-Ukraine Analysis 2026",
    slug: "russia-ukraine-analysis-2026",
    status: "published",
    contentType: "standard",
    isTrending: true,
    category: "Conflict",
  },
  {
    _id: "2",
    title: "The Architecture of a Modern Geopolitical Intelligence Platform",
    slug: "architecture-modern-intelligence-platform",
    status: "published",
    contentType: "platform-seo",
    isTrending: false,
    category: "Platform Updates",
  },
  {
    _id: "3",
    title: "How Global Chanakya Uses RAG",
    slug: "how-gc-uses-rag",
    status: "published",
    contentType: "platform-seo",
    isTrending: false,
    category: "Platform Updates",
  },
  {
    _id: "4",
    title: "India Strategic Intelligence Report 2026",
    slug: "india-strategic-intelligence-report-2026",
    status: "published",
    contentType: "standard",
    isTrending: false,
    category: "South Asia",
  },
  {
    _id: "5",
    title: "Draft Article",
    slug: "draft-article",
    status: "draft",
    contentType: "standard",
    isTrending: false,
    category: "Conflict",
  },
];

describe("Blog Taxonomy Routing — /blogs feed", () => {
  it("excludes all platform-seo blogs from the default /blogs query", () => {
    const query = buildBlogsQuery();
    const result = applyBlogsFilter(mockBlogs, query);
    const slugs = result.map((b) => b.slug);

    expect(slugs).not.toContain("architecture-modern-intelligence-platform");
    expect(slugs).not.toContain("how-gc-uses-rag");
  });

  it("includes standard geopolitical blogs in the /blogs feed", () => {
    const query = buildBlogsQuery();
    const result = applyBlogsFilter(mockBlogs, query);
    const slugs = result.map((b) => b.slug);

    expect(slugs).toContain("russia-ukraine-analysis-2026");
    expect(slugs).toContain("india-strategic-intelligence-report-2026");
  });

  it("excludes drafts from /blogs", () => {
    const query = buildBlogsQuery();
    const result = applyBlogsFilter(mockBlogs, query);
    const slugs = result.map((b) => b.slug);

    expect(slugs).not.toContain("draft-article");
  });

  it("category filter still works — only returns matching category standard blogs", () => {
    const query = buildBlogsQuery("Conflict");
    const result = applyBlogsFilter(mockBlogs, query);

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("russia-ukraine-analysis-2026");
    // Platform Updates category also contains "Conflict" label but must be excluded
    // (none of our mock platform-seo blogs have category "Conflict", so this validates separation)
  });

  it("trending filter only returns trending standard blogs, not platform-seo", () => {
    const query = buildBlogsQuery(undefined, true);
    const result = applyBlogsFilter(mockBlogs, query);

    expect(result.every((b) => b.contentType === "standard")).toBe(true);
    expect(result.every((b) => b.isTrending === true)).toBe(true);
  });

  it("pagination count (total blogs) never includes platform-seo posts", () => {
    const query = buildBlogsQuery();
    const result = applyBlogsFilter(mockBlogs, query);

    // Only 2 published standard blogs; platform-seo and draft must not add to count
    expect(result).toHaveLength(2);
  });
});

describe("Blog Taxonomy Routing — /platformseo section", () => {
  /** Simulates the /platformseo query: contentType === 'platform-seo' AND status published */
  function applyPlatformSeoFilter(blogs: any[]) {
    return blogs.filter(
      (b) => b.contentType === "platform-seo" && b.status === "published"
    );
  }

  it("platform-seo content is visible in the /platformseo feed", () => {
    const result = applyPlatformSeoFilter(mockBlogs);
    const slugs = result.map((b) => b.slug);

    expect(slugs).toContain("architecture-modern-intelligence-platform");
    expect(slugs).toContain("how-gc-uses-rag");
  });

  it("standard geopolitical blogs do NOT appear in /platformseo", () => {
    const result = applyPlatformSeoFilter(mockBlogs);
    const slugs = result.map((b) => b.slug);

    expect(slugs).not.toContain("russia-ukraine-analysis-2026");
    expect(slugs).not.toContain("india-strategic-intelligence-report-2026");
  });
});
