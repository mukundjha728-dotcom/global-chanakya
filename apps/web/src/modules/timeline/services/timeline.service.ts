import { TimelineRepository } from "../repositories/timeline.repository";
import { memoryCache } from "@/lib/cache/memory.cache";

export class TimelineService {
  static async getEntityTimeline(entityType: string, entityId: string) {
    const cacheKey = `timeline:${entityType}:${entityId}`;
    const cached = await memoryCache.get(cacheKey);
    if (cached) return cached;

    const data = await TimelineRepository.getEventsForEntity(entityType, entityId);
    await memoryCache.set(cacheKey, data, 300);
    return data;
  }

  static async getGlobalRecentEvents(limit: number = 20) {
    const cacheKey = `timeline:global:${limit}`;
    const cached = await memoryCache.get(cacheKey);
    if (cached) return cached;

    const data = await TimelineRepository.getRecentEvents(limit);
    await memoryCache.set(cacheKey, data, 120); // 2 minute cache
    return data;
  }
}
