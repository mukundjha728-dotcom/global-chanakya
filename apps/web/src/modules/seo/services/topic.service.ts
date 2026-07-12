import { Country } from "@/lib/models/Country";
import { Leader } from "@/lib/models/Leader";
import { Conflict } from "@/lib/models/Conflict";
import { Blog, IBlog } from "@/lib/models/Blog";
import { ICountry } from "@/lib/models/Country";
import { ILeader } from "@/lib/models/Leader";
import { IConflict } from "@/lib/models/Conflict";
import dbConnect from "@/lib/mongoose";

export class TopicService {
  /**
   * Normalizes an SEO tag/slug: "Indo Pacific" -> "indo-pacific", "China-Taiwan Conflict" -> "china-taiwan-conflict"
   */
  static normalizeSlug(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
      .replace(/\-\-+/g, '-');     // Replace multiple - with single -
  }

  /**
   * Extracts all unique normalized topics across all entities for the sitemap.
   */
  static async getAllUniqueTopics(): Promise<{ slug: string; original: string }[]> {
    await dbConnect();
    
    // In a massive DB, this should be pre-computed via a cron job into a `Topic` collection.
    // For now, we aggregate tags from all models.
    const [leaders, conflicts, blogs] = await Promise.all([
      Leader.distinct("tags"),
      Conflict.distinct("tags"),
      Blog.distinct("tags"),
    ]);

    const allTags = [...leaders, ...conflicts, ...blogs];
    const uniqueMap = new Map<string, string>();

    for (const tag of allTags) {
      if (!tag) continue;
      const slug = this.normalizeSlug(tag);
      if (!uniqueMap.has(slug)) {
        uniqueMap.set(slug, tag);
      }
    }

    return Array.from(uniqueMap.entries()).map(([slug, original]) => ({ slug, original }));
  }

  /**
   * Fetches the "Intelligence Command Center" payload for a specific topic slug.
   */
  static async getTopicHubData(slug: string) {
    await dbConnect();

    // Since our tags might be stored in original format (e.g. "Indo Pacific"), 
    // and we only have the slug ("indo-pacific"), we need to do a regex match or match normalized.
    // However, querying by regex on millions of rows is slow. 
    // In an enterprise system, you would store a `normalizedTags` array.
    // For now, we will fetch candidates and filter, or use a flexible regex.
    const slugRegex = new RegExp(slug.replace(/-/g, '.*'), "i");

    const [countries, leaders, conflicts, blogs] = await Promise.all([
      Country.find({ alliances: { $regex: slugRegex } }).lean<ICountry[]>(),
      Leader.find({ tags: { $regex: slugRegex } }).lean<ILeader[]>(),
      Conflict.find({ tags: { $regex: slugRegex } }).lean<IConflict[]>(),
      Blog.find({ tags: { $regex: slugRegex }, status: "published" }).lean<IBlog[]>(),
    ]);

    return {
      countries: countries.map((c: any) => ({ ...c, _id: c._id?.toString(), createdAt: c.createdAt?.toISOString(), updatedAt: c.updatedAt?.toISOString(), type: "country" })),
      leaders: leaders.map((l: any) => ({ ...l, _id: l._id?.toString(), createdAt: l.createdAt?.toISOString(), updatedAt: l.updatedAt?.toISOString(), type: "leader" })),
      conflicts: conflicts.map((c: any) => ({ ...c, _id: c._id?.toString(), createdAt: c.createdAt?.toISOString(), updatedAt: c.updatedAt?.toISOString(), type: "conflict" })),
      reports: blogs.map((b: any) => ({ ...b, _id: b._id?.toString(), createdAt: b.createdAt?.toISOString(), updatedAt: b.updatedAt?.toISOString(), publishAt: b.publishAt?.toISOString(), type: "report" })),
    };
  }
}
