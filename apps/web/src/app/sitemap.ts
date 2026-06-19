import { MetadataRoute } from 'next';
import { getStaticSitemaps } from '@/modules/seo/sitemap-static';
import { getEntitySitemaps } from '@/modules/seo/sitemap-entities';
import { getBlogSitemaps } from '@/modules/seo/sitemap-blogs';
import { getTopicSitemaps } from '@/modules/seo/sitemap-topics';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [staticMaps, entities, blogs, topics] = await Promise.all([
      getStaticSitemaps(),
      getEntitySitemaps(),
      getBlogSitemaps(),
      getTopicSitemaps(),
    ]);

    return [...staticMaps, ...entities, ...blogs, ...topics];
  } catch (e) {
    // Return base sitemap if DB fails during build
    return getStaticSitemaps();
  }
}
