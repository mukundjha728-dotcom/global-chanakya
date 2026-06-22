import { MetadataRoute } from 'next';
import { getStaticSitemaps } from '@/modules/seo/sitemap-static';
import { getEntitySitemaps } from '@/modules/seo/sitemap-entities';
import { getBlogSitemaps } from '@/modules/seo/sitemap-blogs';
import { getTopicSitemaps } from '@/modules/seo/sitemap-topics';
import { getPlatformSeoSitemaps } from '@/modules/seo/sitemap-platformseo';

export const revalidate = 3600; // Update sitemap every hour for new blogs

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [staticMaps, entities, blogs, topics, platformSeo] = await Promise.all([
      getStaticSitemaps(),
      getEntitySitemaps(),
      getBlogSitemaps(),
      getTopicSitemaps(),
      getPlatformSeoSitemaps(),
    ]);

    return [...staticMaps, ...entities, ...blogs, ...topics, ...platformSeo];
  } catch (e) {
    // Return base sitemap if DB fails during build
    return getStaticSitemaps();
  }
}
