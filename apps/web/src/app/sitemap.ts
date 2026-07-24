import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongoose';
import { Blog } from '@/lib/models/Blog';
import { SITE_URL } from '@/constants';

import { getStaticSitemaps } from '@/modules/seo/sitemap-static';
import { getEntitySitemaps } from '@/modules/seo/sitemap-entities';
import { getTopicSitemaps } from '@/modules/seo/sitemap-topics';
import { getPlatformSeoSitemaps } from '@/modules/seo/sitemap-platformseo';

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
    try {
      const [staticMaps, topics, platformSeo, entities] = await Promise.all([
        getStaticSitemaps(),
        getTopicSitemaps(),
        getPlatformSeoSitemaps(),
        getEntitySitemaps(),
      ]);

      // Fetch dynamic categories
      const categories = await Blog.distinct('category', { status: 'published' });
      const categoryRoutes = categories.filter(Boolean).map((cat: string) => ({
        url: `${SITE_URL}/categories?type=${encodeURIComponent(cat.toLowerCase())}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })) as MetadataRoute.Sitemap;

      return [...staticMaps, ...topics, ...platformSeo, ...entities, ...categoryRoutes];
    } catch (e) {
      console.error("Error generating sitemap static routes:", e);
      return getStaticSitemaps();
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
