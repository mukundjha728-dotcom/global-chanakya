import { MetadataRoute } from 'next';
import { Blog } from '@/lib/models/Blog';
import dbConnect from '@/lib/mongoose';

import { SITE_URL } from "@/constants";

export async function getBlogSitemaps(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();
  
  const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt').lean<IBlog[]>();

  return blogs.map((b: IBlog) => ({
    url: `${SITE_URL}/blogs/${encodeURIComponent(b.slug || "")}`,
    lastModified: b.updatedAt,
    changeFrequency: 'daily',
    priority: 0.9,
  }));
}
