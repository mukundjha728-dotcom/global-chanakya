import { Blog, IBlog } from "@/lib/models/Blog";
import dbConnect from "@/lib/mongoose";

export class BlogRepository {
  static async findById(id: string): Promise<IBlog | null> {
    await dbConnect();
    return Blog.findById(id).lean();
  }

  static async findBySlug(slug: string): Promise<IBlog | null> {
    await dbConnect();
    return Blog.findOne({ slug }).lean();
  }

  static async getTrending(limit: number = 6): Promise<any[]> {
    await dbConnect();
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    return Blog.aggregate([
      {
        $match: {
          status: "published",
          visibility: { $in: ["public", "premium", "private"] },
        },
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$analytics.views", 1] },
              { $multiply: ["$analytics.likes", 3] },
              { $multiply: ["$analytics.bookmarks", 2] },
              { $cond: ["$isTrending", 500, 0] },
              { $cond: [{ $gte: ["$publishAt", fortyEightHoursAgo] }, 200, 0] },
            ],
          },
        },
      },
      { $sort: { trendingScore: -1, publishAt: -1 } },
      { $limit: limit },
      {
        $project: {
          title: 1, slug: 1, excerpt: 1, category: 1, visibility: 1,
          featuredImage: 1, isTrending: 1, trendingScore: 1, analytics: 1,
          publishAt: 1, createdAt: 1
        }
      }
    ]);
  }

  static async getLatest(limit: number = 6): Promise<IBlog[]> {
    await dbConnect();
    return Blog.find({ status: "published" }, {
      title: 1, slug: 1, excerpt: 1, category: 1, visibility: 1,
      featuredImage: 1, isTrending: 1, analytics: 1, publishAt: 1, createdAt: 1
    })
      .sort({ publishAt: -1 })
      .limit(limit)
      .lean();
  }

  static async create(data: Partial<IBlog>): Promise<IBlog> {
    await dbConnect();
    return Blog.create(data);
  }

  static async update(id: string, data: Partial<IBlog>): Promise<IBlog | null> {
    await dbConnect();
    return Blog.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
  }

  static async delete(id: string): Promise<boolean> {
    await dbConnect();
    const result = await Blog.findByIdAndDelete(id);
    return !!result;
  }
}
