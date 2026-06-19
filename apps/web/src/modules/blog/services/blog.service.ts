import { BlogRepository } from "../repositories/blog.repository";
import { IBlog } from "@/lib/models/Blog";
import { memoryCache } from "@/lib/cache/memory.cache";

export class BlogService {
  static async getBlogById(id: string) {
    return BlogRepository.findById(id);
  }

  static async getBlogBySlug(slug: string) {
    return BlogRepository.findBySlug(slug);
  }

  static async getTrendingBlogs(limit: number = 6) {
    const cacheKey = `blogs:trending:${limit}`;
    const cached = await memoryCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await BlogRepository.getTrending(limit);
    await memoryCache.set(cacheKey, data, 300); // 300s TTL
    return data;
  }

  static async getLatestBlogs(limit: number = 6) {
    const cacheKey = `blogs:latest:${limit}`;
    const cached = await memoryCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await BlogRepository.getLatest(limit);
    await memoryCache.set(cacheKey, data, 300);
    return data;
  }

  static async getAdminBlogs(limit: number = 100) {
    return BlogRepository.getAdminBlogs(limit);
  }

  static async getBlogsByStatus(status: string, limit: number) {
    return BlogRepository.findBlogsByStatus(status, limit);
  }

  static async createBlog(data: Partial<IBlog>) {
    // Business logic like generating slugs, auto-setting earlyAccess, etc.
    return BlogRepository.create(data);
  }

  static async updateBlog(id: string, data: Partial<IBlog>) {
    return BlogRepository.update(id, data);
  }

  static async incrementAnalytics(id: string, field: string, amount: number) {
    return BlogRepository.incrementAnalytics(id, field, amount);
  }

  static async deleteBlog(id: string) {
    return BlogRepository.delete(id);
  }
}
