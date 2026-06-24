import { MetadataRoute } from 'next';
import { getStaticSitemaps } from '@/modules/seo/sitemap-static';
import { getEntitySitemaps } from '@/modules/seo/sitemap-entities';
import { getBlogSitemaps } from '@/modules/seo/sitemap-blogs';
import { getTopicSitemaps } from '@/modules/seo/sitemap-topics';
import { getPlatformSeoSitemaps } from '@/modules/seo/sitemap-platformseo';

export const revalidate = 3600; // Update sitemap every hour for new blogs

export async function generateSitemaps() {
  return [
    { id: 0 }, // static, topics, platformseo
    { id: 1 }, // entities
    { id: 2 }, // blogs
  ];
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  try {
    switch (id) {
      case 0:
        const [staticMaps, topics, platformSeo] = await Promise.all([
          getStaticSitemaps(),
          getTopicSitemaps(),
          getPlatformSeoSitemaps(),
        ]);
        return [...staticMaps, ...topics, ...platformSeo];
      case 1:
        return await getEntitySitemaps();
      case 2:
        return await getBlogSitemaps();
      default:
        return [];
    }
  } catch (e) {
    // Return base sitemap if DB fails during build
    return id === 0 ? getStaticSitemaps() : [];
  }
}
