import { MetadataRoute } from 'next';

import { SITE_URL } from "@/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/country/',
          '/leader/',
          '/conflict/',
          '/conflicts/',
          '/topic/',
          '/blogs/',
          '/categories/',
          '/regions/',
          '/platformseo/',
          '/about/',
          '/careers/',
          '/contact/',
          '/privacy/',
          '/terms/',
          '/subscribe/',
          '/llms.txt'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/auth/',
          '/settings/',
          '/gc-control-9x7k/'
        ],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Anthropic-ai', 'PerplexityBot', 'Claude-Web', 'Google-Extended'],
        allow: ['/llms.txt', '/blogs/'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
