import { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/dashboard',
        '/profile',
        '/api/private',
        '/api/admin',
      ],
      crawlDelay: 2,
    },
    sitemap: `${SITE_URL}/sitemap-index.xml`,
  };
}
