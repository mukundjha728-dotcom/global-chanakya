import { BlogRepository } from "../repositories/blog.repository";
import { IBlog, Blog } from "@/lib/models/Blog";
import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/mongoose";

export class BlogService {
  static getActiveCategories = unstable_cache(
    async () => {
      await dbConnect();
      const categories = await Blog.distinct("category", { status: "published" });
      return categories.filter(Boolean);
    },
    ['blogs-active-categories'],
    { revalidate: 3600, tags: ['blogs'] }
  );

  static async getBlogById(id: string) {
    return BlogRepository.findById(id);
  }

  static async getBlogBySlug(slug: string) {
    return BlogRepository.findBySlug(slug);
  }

  static async searchBlogs(query: string, limit?: number) {
    return BlogRepository.searchBlogs(query, limit);
  }

  static getTrendingBlogs = unstable_cache(
    async (limit: number = 6) => {
      const data = await BlogRepository.getTrending(limit);
      return JSON.parse(JSON.stringify(data));
    },
    ['blogs-trending'],
    { revalidate: 300, tags: ['blogs'] }
  );

  static getLatestBlogs = unstable_cache(
    async (limit: number = 6) => {
      const data = await BlogRepository.getLatest(limit);
      return JSON.parse(JSON.stringify(data));
    },
    ['blogs-latest'],
    { revalidate: 300, tags: ['blogs'] }
  );

  static getBlogsByCategory = unstable_cache(
    async (category: string, limit: number = 4) => {
      const data = await BlogRepository.getBlogsByCategory(category, limit);
      return JSON.parse(JSON.stringify(data));
    },
    ['blogs-category'],
    { revalidate: 300, tags: ['blogs'] }
  );

  static getMostViewedBlog = unstable_cache(
    async () => {
      const data = await BlogRepository.getMostViewed();
      return data ? JSON.parse(JSON.stringify(data)) : null;
    },
    ['blogs-most-viewed'],
    { revalidate: 300, tags: ['blogs'] }
  );

  static getMostViewedBlogPast7Days = unstable_cache(
    async () => {
      const data = await BlogRepository.getMostViewedPast7Days();
      return data ? JSON.parse(JSON.stringify(data)) : null;
    },
    ['blogs-most-viewed-7days'],
    { revalidate: 300, tags: ['blogs'] }
  );

  static async getAdminBlogs(limit: number = 0) {
    return BlogRepository.getAdminBlogs(limit);
  }

  static async getBlogsByStatus(status: string, limit: number) {
    return BlogRepository.findBlogsByStatus(status, limit);
  }

  static async createBlog(data: Partial<IBlog>) {
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

