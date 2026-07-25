import { MetadataRoute } from 'next';

export async function getEntitySitemaps(): Promise<MetadataRoute.Sitemap> {
  // All entity types (countries, leaders, conflicts) have been removed
  return [];
}
