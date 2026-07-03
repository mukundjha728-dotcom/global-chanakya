import { Blog, IBlog } from "@/lib/models/Blog";
import dbConnect from "@/lib/mongoose";

export class BlogRepository {
  static async findById(id: string): Promise<IBlog | null> {
    await dbConnect();
    return Blog.findById(id).lean();
  }

  static async findBySlug(slug: string): Promise<IBlog | null> {
    await dbConnect();
    const decodedSlug = decodeURIComponent(slug);
    return Blog.findOne({ slug: decodedSlug }).lean();
  }

  static async searchBlogs(query: string, limit: number = 5): Promise<IBlog[]> {
    await dbConnect();
    return Blog.find(
      {
        status: "published",
        visibility: { $in: ["public", "premium", "private"] },
        $or: [
          { title: { $regex: query, $options: "i" } },
          { excerpt: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
        ]
      },
      {
        title: 1, slug: 1, excerpt: 1, category: 1,
        featuredImage: 1, publishAt: 1
      }
    )
      .sort({ publishAt: -1 })
      .limit(limit)
      .lean();
  }

  static async getTrending(limit: number = 6): Promise<IBlog[]> {
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

  static async getBlogsByCategory(category: string, limit: number = 4): Promise<IBlog[]> {
    await dbConnect();
    return Blog.find({ status: "published", category: new RegExp(`^${category}$`, 'i') }, {
      title: 1, slug: 1, excerpt: 1, category: 1, visibility: 1,
      featuredImage: 1, isTrending: 1, analytics: 1, publishAt: 1, createdAt: 1
    })
      .sort({ publishAt: -1 })
      .limit(limit)
      .lean();
  }

  static async getMostViewed(): Promise<IBlog | null> {
    await dbConnect();
    const result = await Blog.find({ status: "published", visibility: { $in: ["public", "premium", "private"] } }, {
      title: 1, slug: 1, excerpt: 1, category: 1, visibility: 1,
      featuredImage: 1, isTrending: 1, analytics: 1, publishAt: 1, createdAt: 1
    })
      .sort({ "analytics.views": -1 })
      .limit(1)
      .lean();
    return result[0] || null;
  }

  static async getMostViewedPast7Days(): Promise<IBlog | null> {
    await dbConnect();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const result = await Blog.find({ 
      status: "published", 
      visibility: { $in: ["public", "premium", "private"] },
      publishAt: { $gte: sevenDaysAgo }
    }, {
      title: 1, slug: 1, excerpt: 1, category: 1, visibility: 1,
      featuredImage: 1, isTrending: 1, analytics: 1, publishAt: 1, createdAt: 1
    })
      .sort({ "analytics.views": -1 })
      .limit(1)
      .lean();
    return result[0] || null;
  }

  static async getAdminBlogs(limit: number = 0): Promise<IBlog[]> {
    await dbConnect();
    const query = Blog.find({}).sort({ createdAt: -1 });
    if (limit > 0) query.limit(limit);
    return query.lean();
  }

  static async findBlogsByStatus(status: string, limit: number): Promise<IBlog[]> {
    await dbConnect();
    return Blog.find({ status })
      .sort({ publishAt: -1 })
      .limit(limit)
      .populate('author', 'name avatar')
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

  static async incrementAnalytics(id: string, field: string, amount: number): Promise<void> {
    await dbConnect();
    const filter: any = { _id: id };
    if (amount < 0) {
      filter[`analytics.${field}`] = { $gt: 0 };
    }
    await Blog.updateOne(
      filter,
      { $inc: { [`analytics.${field}`]: amount } }
    ).exec();
  }

  static async delete(id: string): Promise<boolean> {
    await dbConnect();
    const result = await Blog.findByIdAndDelete(id);
    return !!result;
  }
}
