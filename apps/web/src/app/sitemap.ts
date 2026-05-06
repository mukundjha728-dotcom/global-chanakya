import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongoose';
import { Blog } from '@/lib/models/Blog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://global-chanakya-web.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await dbConnect();
    // Fetch all published blogs
    const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt');

    const blogEntries: MetadataRoute.Sitemap = blogs.map((blog) => ({
      url: `${SITE_URL}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${SITE_URL}/blogs`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/subscribe`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      ...blogEntries,
    ];
  } catch (e) {
    // Return base sitemap if DB fails during build
    return [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      }
    ];
  }
}
