import { WatchlistRepository } from "@/modules/watchlist/repositories/watchlist.repository";
import { BlogRepository } from "@/modules/blog/repositories/blog.repository";
import { memoryCache } from "@/lib/cache/memory.cache";

export interface FeedItem {
  id: string;
  type: "blog";
  title: string;
  description: string;
  date: Date;
  score: number;
  tags?: string[];
  meta?: { category?: string };
}

export class FeedService {
  static async getPersonalizedFeed(userId: string, limit: number = 20): Promise<FeedItem[]> {
    const cacheKey = `feed:${userId}`;
    const cached = await memoryCache.get<FeedItem[]>(cacheKey);
    if (cached) return cached;

    // 1. Get user's topic watchlist
    const watchlist = await WatchlistRepository.getByUser(userId);
    // Depending on what entityId represents for topics, we can match blogs

    // 2. Fetch recent blogs
    const recentBlogs = await BlogRepository.getLatest(20);

    const feed: FeedItem[] = [];
    const now = new Date().getTime();

    // Process Blogs
    for (const blog of recentBlogs) {
      // Basic blog scoring
      const hoursOld = (now - new Date(blog.publishAt!).getTime()) / (1000 * 60 * 60);
      const recencyScore = Math.max(0, 50 - hoursOld);
      const score = (blog.isTrending ? 80 : 40) + recencyScore;

      feed.push({
        id: blog._id.toString(),
        type: "blog",
        title: blog.title,
        description: blog.excerpt,
        date: blog.publishAt!,
        score,
        tags: blog.tags,
        meta: { category: blog.category }
      });
    }

    // Sort by calculated score descending
    feed.sort((a, b) => b.score - a.score);
    
    const finalFeed = feed.slice(0, limit);
    await memoryCache.set(cacheKey, finalFeed, 300); // cache for 5 mins
    return finalFeed;
  }
}
