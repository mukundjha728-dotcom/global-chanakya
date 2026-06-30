import { MetadataRoute } from 'next';
import { getStaticSitemaps } from '@/modules/seo/sitemap-static';
import { getEntitySitemaps } from '@/modules/seo/sitemap-entities';
import { getBlogSitemaps } from '@/modules/seo/sitemap-blogs';
import { getTopicSitemaps } from '@/modules/seo/sitemap-topics';
import { getPlatformSeoSitemaps } from '@/modules/seo/sitemap-platformseo';

export const revalidate = 3600; // Update sitemap every hour for new blogs

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [staticMaps, topics, platformSeo, entities, blogs] = await Promise.all([
      getStaticSitemaps(),
      getTopicSitemaps(),
      getPlatformSeoSitemaps(),
      getEntitySitemaps(),
      getBlogSitemaps(),
    ]);
    return [...staticMaps, ...topics, ...platformSeo, ...entities, ...blogs];
  } catch (e) {
    // Return base sitemap if DB fails during build
    return getStaticSitemaps();
  }
}
