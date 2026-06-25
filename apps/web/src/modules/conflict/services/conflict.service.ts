import { Conflict, IConflict } from "@/lib/models/Conflict";
import dbConnect from "@/lib/mongoose";
import { memoryCache } from "@/lib/cache/memory.cache";

export class ConflictService {
  static async getConflictBySlug(slug: string, preview: boolean = false): Promise<IConflict | null> {
    const cacheKey = `conflict:${slug}:${preview}`;
    const cached = await memoryCache.get<IConflict>(cacheKey);
    if (cached) return cached;

    await dbConnect();
    const query: any = { slug, isDeleted: false };
    if (!preview) query.status = "published";

    const data = await Conflict.findOne(query).lean();
    if (data) {
      await memoryCache.set(cacheKey, data as IConflict, preview ? 60 : 300);
    }
    return data as IConflict | null;
  }

  static async getConflictsByCountry(countryId: string, preview: boolean = false): Promise<IConflict[]> {
    const cacheKey = `conflicts_by_country:${countryId}:${preview}`;
    const cached = await memoryCache.get<IConflict[]>(cacheKey);
    if (cached) return cached;

    await dbConnect();
    const query: any = { "involvedParties.countryId": countryId, isDeleted: false };
    if (!preview) query.status = "published";

    const data = await Conflict.find(query).lean();
    await memoryCache.set(cacheKey, data as IConflict[], preview ? 60 : 300);
    return data as IConflict[];
  }

  static async getAllConflicts(limit?: number, preview: boolean = false): Promise<IConflict[]> {
    const cacheKey = `conflicts:all:${limit || 'no-limit'}:${preview}`;
    const cached = await memoryCache.get<IConflict[]>(cacheKey);
    if (cached) return cached;

    await dbConnect();
    const query: any = { isDeleted: false };
    if (!preview) query.status = "published";

    let mQuery = Conflict.find(query).sort({ updatedAt: -1 });
    if (limit) {
      mQuery = mQuery.limit(limit);
    }
    const data = await mQuery.lean();
    await memoryCache.set(cacheKey, data as IConflict[], preview ? 60 : 300);
    return data as IConflict[];
  }
}
