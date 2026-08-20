import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';
import { Blog } from '@/lib/models/Blog';
import { SITE_URL } from '@/constants';
import { EntityService } from './services/entity.service';

export async function getEntitySitemaps(modelName: string, pathSegment: string, relationshipField: string): Promise<MetadataRoute.Sitemap> {
  await dbConnect();
  
  const Model = mongoose.models[modelName];
  if (!Model) return [];

  const entities = await Model.find({ status: { $ne: 'inactive' } }).select('slug updatedAt').lean();
  
  const sitemap: MetadataRoute.Sitemap = [];

  for (const entity of entities) {
    // Only include entities that have enough articles to be indexed
    const articleCount = await Blog.countDocuments({
      [relationshipField]: entity._id,
      status: "published"
    });

    const indexationStatus = EntityService.determineIndexation(articleCount);
    
    if (indexationStatus === "index") {
      sitemap.push({
        url: `${SITE_URL}/${pathSegment}/${entity.slug}`,
        lastModified: entity.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return sitemap;
}
