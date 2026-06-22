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
    ...countries.map((c: ICountry) => ({
      url: `${SITE_URL}/country/${encodeURIComponent(c.slug || "")}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...leaders.map((l: ILeader) => ({
      url: `${SITE_URL}/leader/${encodeURIComponent(l.slug || "")}`,
      lastModified: l.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...conflicts.map((c: IConflict) => ({
      url: `${SITE_URL}/conflict/${encodeURIComponent(c.slug || "")}`,
      lastModified: c.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ];
}
