import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongoose';
import { Blog } from '@/lib/models/Blog';

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

  try {
    await dbConnect();
    const blogs = await Blog.find(
      { contentType: "platform-seo", status: "published" },
      { slug: 1, publishAt: 1 }
    ).lean();

    const blogUrls = blogs.map((blog: any) => ({
      url: `${baseUrl}/platformseo/${blog.slug}`,
      lastModified: blog.publishAt ? new Date(blog.publishAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...sitemap, ...blogUrls];
  } catch {
    // If DB is unreachable during build, return just the index
    return sitemap;
  }
}
