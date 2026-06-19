import { Country, ICountry } from "@/lib/models/Country";
import dbConnect from "@/lib/mongoose";
import { memoryCache } from "@/lib/cache/memory.cache";

export class CountryService {
  static async getCountryBySlug(slug: string): Promise<ICountry | null> {
    const cacheKey = `country:${slug}`;
    const cached = await memoryCache.get<ICountry>(cacheKey);
    if (cached) return cached;

    await dbConnect();
    const data = await Country.findOne({ slug }).lean();
    if (data) {
      await memoryCache.set(cacheKey, data as ICountry, 300);
    }
    return data as ICountry | null;
  }
}
