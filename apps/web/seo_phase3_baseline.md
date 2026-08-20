# PHASE 3: SEO ARCHITECTURE BASELINE AUDIT

## 1. Current Route Architecture
- **Blogs**: `/blogs/[slug]` is the core content page. Fetches articles by slug.
- **Blog Listing**: `/blogs?category=xyz` is used to filter by category.
- **Legacy Topics**: `/topic/[slug]` is used as a tag hub, searching the `tags` array using case-insensitive regex.
- **Static Pages**: `/about`, `/breaking`, `/methodology`, etc. exist.
- **API Routes**: `/api/blogs/[slug]/...` for view tracking, likes, and comments.

## 2. Current Canonical Strategy
- **Homepage**: No specific `metadataBase` in `layout.tsx` overrides, but it sets `metadataBase: new URL(SITE_URL)`.
- **Blogs**: `canonicalUrl: blog.seo?.canonicalUrl || ${SITE_URL}/blogs/${blog.slug}`
- **Topic Hubs**: `canonicalUrl: ${SITE_URL}/topic/${slug}`
- **Blog Listing**: `alternates: { canonical: "/blogs" }`

## 3. Current Sitemap Strategy
- Uses Next.js 15 App Router `sitemap.ts` dynamic chunking feature (returning `{id}` blocks from `generateSitemaps`).
- `sitemap.xml` redirects to `sitemap-index.xml`.
- Includes static sitemaps, legacy topic sitemaps, platform SEO sitemaps, and paginated blog sitemaps (chunked by 1000).

## 4. Existing Topic Behavior
- URL Pattern: `/topic/[slug]`
- Component: Fetches via `TopicService.getTopicHubData(slug)`
- Query Method: `Blog.find({ tags: { $regex: slugRegex }, status: "published" })` (Regex scan, unbounded).
- Page: Displays a `CollectionPage` schema with an `ItemList` of articles. Displays a list of `RelatedIntelligence`.

## 5. Existing Category Query Behavior
- URL Pattern: `/blogs?category=[CategoryName]`
- Query Method: `Blog.find({ category: category, status: "published" })` inside `getCachedBlogs`. 
- Caching: Uses `unstable_cache` keyed by `["blogs-list-cache"]`.

## 6. Existing Metadata Behavior
- `generateMetadata()` is used dynamically across the Next.js App Router pages (e.g., in `/blogs/[slug]`, `/topic/[slug]`).
- Uses `@repo/utils/generateSeoMetadata` (need to review this utility to ensure it maps OpenGraph and Twitter cards correctly).
- Global fallback metadata exists in `layout.tsx`.

## 7. Existing Structured Data (JSON-LD)
- **Global**: `NewsMediaOrganization` and `WebSite` schemas injected in `layout.tsx`.
- **Blogs**: `BlogPosting`, `BreadcrumbList`, and optional `FAQPage` injected in `blogs/[slug]/page.tsx`.
- **Topics**: `CollectionPage` with an `ItemList` injected in `topic/[slug]/page.tsx`.

## 8. Current Internal Link Patterns
- Breadcrumbs are implemented manually on blog pages.
- `RelatedBlogs` component fetches articles in the same legacy string `category`.
- Topic pages link to articles via `/blogs/[slug]`.
- No rich internal linking graph between countries, leaders, organizations, etc., yet.

## 9. Existing Performance / Caching Mechanisms
- **Data Caching**: Next.js `unstable_cache` is extensively used for queries (e.g., `getCachedBlog`, `getCachedBlogs`).
- **React Cache**: `React.cache()` is used to deduplicate requests within a single render cycle.
- **Route Segment Config**: `export const revalidate = 3600;` is present on dynamically generated pages for ISR (Incremental Static Regeneration).

---
**Status:** Audit complete. Ready to plan the implementation of Phase 3.
