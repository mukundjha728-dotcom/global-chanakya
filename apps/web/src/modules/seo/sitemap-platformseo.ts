import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongoose';
import { Blog } from '@/lib/models/Blog';

export async function getPlatformSeoSitemaps(): Promise<MetadataRoute.Sitemap> {
  // PlatformSEO pages are noindex — they must NOT be included in the sitemap.
  return [];
}

