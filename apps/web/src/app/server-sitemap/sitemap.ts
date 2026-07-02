import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongoose';
import { Blog } from '@/lib/models/Blog';
import { SITE_URL } from '@/constants';

const BLOGS_PER_SITEMAP = 1000;

export async function generateSitemaps() {
  try {
    await dbConnect();
    const count = await Blog.countDocuments({ status: 'published' });
    const sitemaps = Math.ceil(count / BLOGS_PER_SITEMAP);
    
    // id 0 is for static pages and categories, id 1 to N is for blogs
    return Array.from({ length: sitemaps + 1 }, (_, i) => ({ id: i }));
  } catch (e) {
    console.error("Error in generateSitemaps:", e);
    return [{ id: 0 }];
  }
}

export default async function sitemap({
  id,
}: {
  id: number | string;
}): Promise<MetadataRoute.Sitemap> {
  await dbConnect();

  const numId = Number(id) || 0;

  if (numId === 0) {
    // Generate static routes, categories, tags
    const staticRoutes = [
      { url: `${SITE_URL}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${SITE_URL}/blogs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
      { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
      { url: `${SITE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ] as MetadataRoute.Sitemap;

    try {
      // Fetch dynamic categories
      const categories = await Blog.distinct('category', { status: 'published' });
      const categoryRoutes = categories.filter(Boolean).map((cat: string) => ({
        url: `${SITE_URL}/categories?type=${encodeURIComponent(cat.toLowerCase())}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })) as MetadataRoute.Sitemap;

      // Fetch dynamic tags
      const tags = await Blog.distinct('tags', { status: 'published' });
      const tagRoutes = tags.filter(Boolean).map((tag: string) => ({
        url: `${SITE_URL}/blogs?tag=${encodeURIComponent(tag.toLowerCase())}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })) as MetadataRoute.Sitemap;

      return [...staticRoutes, ...categoryRoutes, ...tagRoutes];
    } catch (e) {
      console.error("Error generating sitemap static routes:", e);
      return staticRoutes;
    }
  }

  // Handle blog pagination (id >= 1)
  const skip = (numId - 1) * BLOGS_PER_SITEMAP;
  try {
    const blogs = await Blog.find({ status: 'published' })
      .select('slug updatedAt publishAt')
      .sort({ publishAt: -1 })
      .skip(skip)
      .limit(BLOGS_PER_SITEMAP)
      .lean();

    return blogs.map((blog: any) => ({
      url: `${SITE_URL}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt || blog.publishAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (e) {
    console.error(`Error generating sitemap for chunk ${id}:`, e);
    return [];
  }
}
