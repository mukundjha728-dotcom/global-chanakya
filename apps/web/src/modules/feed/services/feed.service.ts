import { WatchlistRepository } from "@/modules/watchlist/repositories/watchlist.repository";
import { TimelineRepository } from "@/modules/timeline/repositories/timeline.repository";
import { BlogRepository } from "@/modules/blog/repositories/blog.repository";
import { memoryCache } from "@/lib/cache/memory.cache";

export interface FeedItem {
  id: string;
  type: "timeline" | "blog";
  title: string;
  description: string;
  date: Date;
  score: number;
  tags?: string[];
  meta?: { entityType?: string; severity?: string; category?: string };
}

export class FeedService {
  static async getPersonalizedFeed(userId: string, limit: number = 20): Promise<FeedItem[]> {
    const cacheKey = `feed:${userId}`;
    const cached = await memoryCache.get<FeedItem[]>(cacheKey);
    if (cached) return cached;

    // 1. Get user's watchlist
    const watchlist = await WatchlistRepository.getByUser(userId);
    const watchedEntityIds = watchlist.map((w) => w.entityId.toString());

    // 2. Fetch recent timeline events (global)
    const recentEvents = await TimelineRepository.getRecentEvents(50);

    // 3. Fetch recent blogs
    const recentBlogs = await BlogRepository.getLatest(20);

    const feed: FeedItem[] = [];
    const now = new Date().getTime();

    // Scoring Multipliers
    const severityMap: Record<string, number> = {
      critical: 100,
      major: 70,
      normal: 40,
      minor: 20,
    };

    // Process Timeline Events
    for (const event of recentEvents) {
      const isWatched = watchedEntityIds.includes(event.entityId.toString());
      
      // Calculate recency (max 50 points for within 24 hours, decaying)
      const hoursOld = (now - new Date(event.eventDate).getTime()) / (1000 * 60 * 60);
      const recencyScore = Math.max(0, 50 - hoursOld);
      
      const watchlistScore = isWatched ? 100 : 0;
      const severityScore = severityMap[event.severity] || 40;

      const score = severityScore + recencyScore + watchlistScore;

      // Only show non-watched items if they are critical/major, or if feed is empty
      if (isWatched || severityScore >= 70) {
        feed.push({
          id: event._id.toString(),
          type: "timeline",
          title: event.title,
          description: event.description,
          date: event.eventDate,
          score,
          tags: event.tags,
          meta: { entityType: event.entityType, severity: event.severity }
        });
      }
    }

    // Process Blogs
    for (const blog of recentBlogs) {
      // Very basic blog scoring
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
