import { Leader, ILeader } from "@/lib/models/Leader";
import dbConnect from "@/lib/mongoose";
import { memoryCache } from "@/lib/cache/memory.cache";
import mongoose from "mongoose";

export class LeaderService {
  static async getLeaderBySlug(slug: string): Promise<ILeader | null> {
    const cacheKey = `leader:${slug}`;
    const cached = await memoryCache.get<ILeader>(cacheKey);
    if (cached) return cached;

    await dbConnect();
    const data = await Leader.findOne({ slug }).lean();
    if (data) {
      await memoryCache.set(cacheKey, data as ILeader, 300);
    }
    return data as ILeader | null;
  }

  static async getLeadersByCountry(countryId: mongoose.Types.ObjectId): Promise<ILeader[]> {
    const cacheKey = `leaders:country:${countryId.toString()}`;
    const cached = await memoryCache.get<ILeader[]>(cacheKey);
    if (cached) return cached;

    await dbConnect();
    const data = await Leader.find({ countryId }).lean();
    await memoryCache.set(cacheKey, data as ILeader[], 300);
    return data as ILeader[];
  }
}
