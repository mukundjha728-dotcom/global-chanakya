import { Conflict, IConflict } from "@/lib/models/Conflict";
import dbConnect from "@/lib/mongoose";
import { memoryCache } from "@/lib/cache/memory.cache";

export class ConflictService {
  static async getConflictBySlug(slug: string): Promise<IConflict | null> {
    const cacheKey = `conflict:${slug}`;
    const cached = await memoryCache.get<IConflict>(cacheKey);
    if (cached) return cached;

    await dbConnect();
    const data = await Conflict.findOne({ slug }).lean();
    if (data) {
      await memoryCache.set(cacheKey, data as IConflict, 300);
    }
    return data as IConflict | null;
  }

  static async getConflictsByCountry(countryId: string): Promise<IConflict[]> {
    const cacheKey = `conflicts_by_country:${countryId}`;
    const cached = await memoryCache.get<IConflict[]>(cacheKey);
    if (cached) return cached;

    await dbConnect();
    const data = await Conflict.find({ "involvedParties.countryId": countryId }).lean();
    await memoryCache.set(cacheKey, data as IConflict[], 300);
    return data as IConflict[];
  }
}
