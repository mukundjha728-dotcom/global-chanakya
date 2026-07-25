import { Blog, IBlog } from "@/lib/models/Blog";

export interface RankedItem {
  type: "report";
  title: string;
  slug: string;
  subtitle: string;
  score: number;
}

export class RelatedIntelligenceService {
  static async getRankedRelations(
    sourceTags: string[] = [],
    limit: number = 6
  ): Promise<RankedItem[]> {
    const results: RankedItem[] = [];
    
    const blogs = await Blog.find({ status: "published" }).sort({ createdAt: -1 }).limit(20).lean<IBlog[]>();

    for (const blog of blogs) {
      const cand = blog as any;
      let score = 0;

      if (cand.tags && sourceTags) {
        const overlap = cand.tags.filter((t: string) => sourceTags.includes(t)).length;
        score += overlap * 10;
      }

      const createdAt = cand.createdAt || null;
      if (createdAt) {
        const daysOld = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 15 - Math.floor(daysOld / 7));
      }

      if (score > 0) {
        results.push({
          type: "report",
          title: cand.title || "Unknown",
          slug: cand.slug,
          subtitle: "Intelligence Brief",
          score
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}
