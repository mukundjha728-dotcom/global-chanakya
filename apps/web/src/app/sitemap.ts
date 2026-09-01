import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongoose';
import { Blog } from '@/lib/models/Blog';
import { SITE_URL } from '@/constants';

import { getStaticSitemaps } from '@/modules/seo/sitemap-static';
import { getPlatformSeoSitemaps } from '@/modules/seo/sitemap-platformseo';
import { getEntitySitemaps } from '@/modules/seo/sitemap-entity';

const BLOGS_PER_SITEMAP = 1000;
export const revalidate = 3600;

export async function generateSitemaps() {
  try {
    await dbConnect();
    const count = await Blog.countDocuments({ status: 'published', contentType: { $ne: 'platform-seo' } });
    const blogSitemaps = Math.ceil(count / BLOGS_PER_SITEMAP);
    
    const chunks = [
      { id: 'static' },
      { id: 'categories' },
      { id: 'topics' },
      { id: 'countries' },
      { id: 'regions' },
      { id: 'leaders' },
      { id: 'conflicts' },
      { id: 'organizations' }
    ];

    for (let i = 0; i < blogSitemaps; i++) {
        chunks.push({ id: `blogs-${i}` });
    }
    
    return chunks;
  } catch (e) {
    console.error("Error in generateSitemaps:", e);
    return [{ id: 'static' }];
  }
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  await dbConnect();

  if (id === 'static') {
    try {
      const [staticMaps, platformSeo] = await Promise.all([
        getStaticSitemaps(),
        getPlatformSeoSitemaps(),
      ]);
      return [...staticMaps, ...platformSeo];
    } catch (e) {
      console.error("Error generating sitemap static routes:", e);
      return getStaticSitemaps();
    }
  }

  // Entity Hubs
  if (id === 'categories') return getEntitySitemaps('Category', 'categories', 'categoryId');
  if (id === 'topics') return getEntitySitemaps('Topic', 'topics', 'topics');
  if (id === 'countries') return getEntitySitemaps('Country', 'countries', 'countries');
  if (id === 'regions') return getEntitySitemaps('Region', 'regions', 'regions');
  if (id === 'leaders') return getEntitySitemaps('Leader', 'leaders', 'leaders');
  if (id === 'conflicts') return getEntitySitemaps('Conflict', 'conflicts', 'conflicts');
  if (id === 'organizations') return getEntitySitemaps('Organization', 'organizations', 'organizations');

  // Handle blog pagination (id starts with 'blogs-')
  if (id.startsWith('blogs-')) {
    const chunkIndex = parseInt(id.replace('blogs-', ''), 10) || 0;
    const skip = chunkIndex * BLOGS_PER_SITEMAP;
    
    try {
      const blogs = await Blog.find({ status: 'published', contentType: { $ne: 'platform-seo' } })
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

  return [];
}
