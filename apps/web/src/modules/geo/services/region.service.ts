import { Region, IRegion } from "@/lib/models/Region";
import dbConnect from "@/lib/mongoose";
import { memoryCache } from "@/lib/cache/memory.cache";

export class RegionService {
  static async getRegionBySlug(slug: string, preview: boolean = false): Promise<IRegion | null> {
    const cacheKey = `region:${slug}:${preview}`;
    const cached = await memoryCache.get<IRegion>(cacheKey);
    if (cached) return cached;

    await dbConnect();
    const query: any = { slug, isDeleted: false };
    if (!preview) query.status = "published";

    const data = await Region.findOne(query).lean();
    if (data) {
      await memoryCache.set(cacheKey, data as IRegion, preview ? 60 : 300);
    }
    return data as IRegion | null;
  }

  static async getAllRegions(preview: boolean = false): Promise<IRegion[]> {
    const cacheKey = `regions:all:${preview}`;
    const cached = await memoryCache.get<IRegion[]>(cacheKey);
    if (cached) return cached;

    await dbConnect();
    const query: any = { isDeleted: false };
    if (!preview) query.status = "published";

    const data = await Region.find(query).lean();
    await memoryCache.set(cacheKey, data as IRegion[], preview ? 60 : 300);
    return data as IRegion[];
  }
}
