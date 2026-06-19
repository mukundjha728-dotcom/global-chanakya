import { Country } from "@/lib/models/Country";
import { Leader } from "@/lib/models/Leader";
import { Conflict } from "@/lib/models/Conflict";
import { Blog, IBlog } from "@/lib/models/Blog";
import { ICountry } from "@/lib/models/Country";
import { ILeader } from "@/lib/models/Leader";
import { IConflict } from "@/lib/models/Conflict";

export interface RankedItem {
  type: "country" | "leader" | "conflict" | "report";
  title: string;
  slug: string;
  subtitle: string;
  score: number;
}

export class RelatedIntelligenceService {
  static async getRankedRelations(
    sourceModel: "Country" | "Leader" | "Conflict",
    sourceId: string,
    sourceTags: string[] = [],
    limit: number = 6
  ): Promise<RankedItem[]> {
    const results: RankedItem[] = [];
    
    const [countries, leaders, conflicts, blogs] = await Promise.all([
      Country.find({ _id: { $ne: sourceId } }).limit(20).lean<ICountry[]>(),
      Leader.find({ _id: { $ne: sourceId } }).limit(20).lean<ILeader[]>(),
      Conflict.find({ _id: { $ne: sourceId } }).limit(20).lean<IConflict[]>(),
      Blog.find({ status: "published" }).sort({ createdAt: -1 }).limit(10).lean<IBlog[]>(),
    ]);

    const candidates = [
      ...countries.map((c) => ({ ...c, type: "country" })),
      ...leaders.map((l) => ({ ...l, type: "leader" })),
      ...conflicts.map((c) => ({ ...c, type: "conflict" })),
      ...blogs.map((b) => ({ ...b, type: "report" })),
    ];

    for (const candidate of candidates) {
      let score = 0;
      
      const relation = (candidate.relations || []).find((r) => r.targetId.toString() === sourceId);
      if (relation) {
        score += relation.weight;
      }

      if (candidate.tags && sourceTags) {
        const overlap = candidate.tags.filter((t: string) => sourceTags.includes(t)).length;
        score += overlap * 10;
      }

      const createdAt = 'createdAt' in candidate ? candidate.createdAt : null;
      if (createdAt) {
        const daysOld = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 15 - Math.floor(daysOld / 7));
      }

      if (candidate.type === "leader" && 'countryId' in candidate && candidate.countryId?.toString() === sourceId) {
        score += 80;
      }

      if (score > 0) {
        let title = "Unknown";
        let subtitle = "";
        if ('title' in candidate) title = candidate.title;
        else if ('name' in candidate) title = candidate.name;

        if (candidate.type === 'report') subtitle = 'Intelligence Brief';
        else if ('status' in candidate) subtitle = candidate.status;
        else if ('geopoliticalStatus' in candidate) subtitle = candidate.geopoliticalStatus;
        else subtitle = title;

        results.push({
          type: candidate.type as "country" | "leader" | "conflict" | "report",
          title,
          slug: candidate.slug,
          subtitle,
          score
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}
