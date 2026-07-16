import { z } from "zod";

// ─── SEO Sub-Schema ───────────────────────────────────────────────────────────
const seoSchema = z.object({
  focusKeyword: z.string().max(100, "Focus keyword too long").optional(),
  title: z.string().max(70, "Meta title max 70 chars").optional(),
  description: z.string().max(200, "Meta description max 200 chars").optional(),
  keywords: z.array(z.string()).max(20, "Max 20 keywords").optional(),
  canonicalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  robots: z.enum(["index,follow", "noindex,follow", "index,nofollow", "noindex,nofollow"]).optional(),
  schemaMarkup: z.string().optional().refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      try { JSON.parse(val); return true; } catch { return false; }
    },
    { message: "Schema markup must be valid JSON" }
  ),
}).optional();

// ─── Citations Sub-Schema ─────────────────────────────────────────────────────
const citationSchema = z.object({
  url: z.string().url("Citation URL must be valid").or(z.literal("")),
  label: z.string().optional(),
  addedAt: z.any().optional(),
}).optional();

// ─── Entity Relations Sub-Schema ──────────────────────────────────────────────
const entityRelationSchema = z.object({
  targetId: z.string().min(1),
  targetModel: z.enum(["Country", "Leader", "Conflict", "Alliance"]),
  type: z.string().min(1),
}).optional();

// ─── Create Blog Schema ──────────────────────────────────────────────────────
export const createBlogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title max 200 chars"),
  slug: z.string().min(3, "Slug is required").max(150, "Slug too long"),
  excerpt: z.string().min(10, "Excerpt is required").max(500, "Excerpt max 500 chars"),
  content: z.string().min(20, "Content is required"),
  category: z.string().min(2, "Category is required"),
  countrySlug: z.string().optional().or(z.literal("")),
  reportType: z.enum(["Analysis", "Briefing", "Op-Ed", "Intelligence", "Report"]).optional(),
  tags: z.array(z.string()).max(30, "Max 30 tags").optional(),
  visibility: z.enum(["public", "premium", "private"]).optional().default("public"),
  status: z.enum(["draft", "published", "archived", "scheduled"]).optional().default("draft"),
  isTrending: z.boolean().optional().default(false),
  commentsEnabled: z.boolean().optional().default(true),
  featuredImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  ogImage: z.string().url("OG image must be a valid URL").optional().or(z.literal("")),
  seo: seoSchema,
  aiSummary: z.string().max(500, "AI Summary max 500 chars").optional(),
  citations: z.array(z.any()).optional(), // Flexible — validated on display
  entityRelations: z.array(z.any()).optional(),
});

// ─── Update Blog Schema ──────────────────────────────────────────────────────
export const updateBlogSchema = createBlogSchema.partial().extend({
  id: z.string().min(1, "Blog ID is required"),
});
