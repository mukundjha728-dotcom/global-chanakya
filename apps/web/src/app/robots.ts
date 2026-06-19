import { MetadataRoute } from 'next';

import { SITE_URL } from "@/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/country/', '/leader/', '/conflict/', '/topic/', '/blogs/'],
      disallow: ['/admin/', '/api/', '/dashboard/', '/auth/', '/settings/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
