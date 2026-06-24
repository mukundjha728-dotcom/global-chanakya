import { redis } from './redis';

/**
 * Cache Strategy Constants (in seconds)
 */
export const CACHE_TTL = {
  TRENDING_ARTICLES: 15 * 60, // 15 min
  RELATED_ARTICLES: 30 * 60, // 30 min
  ARTICLE: 60 * 60, // 1 hr
  COUNTRY_HUB: 6 * 60 * 60, // 6 hr
  CONFLICT_HUB: 6 * 60 * 60, // 6 hr
  LEADER_HUB: 6 * 60 * 60, // 6 hr
  SITEMAP: 12 * 60 * 60, // 12 hr
  LLMS_TXT: 24 * 60 * 60, // 24 hr
};

/**
 * Generic Cache Wrapper
 * 
 * @param key The unique redis key
 * @param fetcher Async function to fetch data if cache miss
 * @param ttl Time to live in seconds
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }
  } catch (error) {
    console.warn(`[Cache Error] Failed to read ${key}:`, error);
  }

  // Cache miss - fetch fresh data
  const data = await fetcher();

  try {
    if (data !== null && data !== undefined) {
      await redis.set(key, data, "EX", ttl);
    }
  } catch (error) {
    console.warn(`[Cache Error] Failed to set ${key}:`, error);
  }

  return data;
}

/**
 * Cache Invalidation Helpers
 */
export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key);
}

export async function invalidateArticleCache(slug: string): Promise<void> {
  await Promise.all([
    redis.del(`article:${slug}`),
    redis.del(`trending_articles`), // Rebuild trending just in case
    redis.del(`sitemap_blogs`), // Force sitemap update
    redis.del(`llms_txt`) // Force AI file update
  ]);
}
