import { z } from "zod";

export const createBlogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(3, "Slug is required"),
  excerpt: z.string().min(10, "Excerpt is required"),
  content: z.string().min(20, "Content is required"),
  category: z.string().min(2, "Category is required"),
  countrySlug: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["public", "premium", "private"]).optional().default("public"),
  status: z.enum(["draft", "published", "archived", "scheduled"]).optional().default("draft"),
  isTrending: z.boolean().optional().default(false),
  commentsEnabled: z.boolean().optional().default(true),
  featuredImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
  aiSummary: z.string().optional(),
});

export const updateBlogSchema = createBlogSchema.partial().extend({
  id: z.string().min(1, "Blog ID is required"),
});
