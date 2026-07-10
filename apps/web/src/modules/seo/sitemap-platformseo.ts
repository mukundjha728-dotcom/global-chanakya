import { MetadataRoute } from 'next';
import { SEO_BLOGS } from '@/constants/platformSeoBlogs';

export async function getPlatformSeoSitemaps(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.globalchanakya.in';

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/platformseo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const blogUrls = SEO_BLOGS.map((blog) => ({
    url: `${baseUrl}/platformseo/${blog.slug}`,
    lastModified: new Date(blog.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...sitemap, ...blogUrls];
}
