import { MetadataRoute } from 'next';
import { Country } from '@/lib/models/Country';
import { Leader } from '@/lib/models/Leader';
import { Conflict } from '@/lib/models/Conflict';
import dbConnect from '@/lib/mongoose';

import { SITE_URL } from "@/constants";

export async function getEntitySitemaps(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();
  
  const [countries, leaders, conflicts] = await Promise.all([
    Country.find().select('slug updatedAt').lean(),
    Leader.find().select('slug updatedAt').lean(),
    Conflict.find().select('slug updatedAt').lean(),
  ]);

  return [
    ...countries.flatMap((c: any) => {
      const base = {
        url: `${SITE_URL}/countries/${encodeURIComponent(c.slug || "")}`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      };
      
      const topics = ['history', 'military', 'economy', 'politics', 'blog'].map(topic => ({
        url: `${SITE_URL}/countries/${encodeURIComponent(c.slug || "")}/${topic}`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

      return [base, ...topics];
    }),
    ...leaders.map((l: any) => ({
      url: `${SITE_URL}/leader/${encodeURIComponent(l.slug || "")}`,
      lastModified: l.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...conflicts.map((c: any) => ({
      url: `${SITE_URL}/conflict/${encodeURIComponent(c.slug || "")}`,
      lastModified: c.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ];
}
