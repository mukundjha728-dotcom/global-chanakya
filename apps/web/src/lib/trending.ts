import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";

export interface TrendingBlog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  visibility: string;
  featuredImage?: string;
  isTrending: boolean;
  trendingScore: number;
  analytics: {
    views: number;
    likes: number;
    bookmarks: number;
    readTime: number;
  };
  publishAt: string;
  createdAt: string;
}

/**
 * Trending Score Algorithm:
 *  score = (views × 1) + (likes × 3) + (bookmarks × 2) + (isTrending ? 500 : 0)
 *  Recency boost: articles < 48h old get +200 bonus
 *  Only published + public/premium articles are shown
 */
export async function getTrendingBlogs(limit = 6): Promise<TrendingBlog[]> {
  await dbConnect();

  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const blogs = await Blog.aggregate([
    // Only published, non-private articles
    {
      $match: {
        status: "published",
        visibility: { $in: ["public", "premium"] },
      },
    },
    // Compute trending score
    {
      $addFields: {
        recencyBonus: {
          $cond: [{ $gte: ["$publishAt", fortyEightHoursAgo] }, 200, 0],
        },
        trendingScore: {
          $add: [
            { $multiply: ["$analytics.views", 1] },
            { $multiply: ["$analytics.likes", 3] },
            { $multiply: ["$analytics.bookmarks", 2] },
            {
              $cond: ["$isTrending", 500, 0],
            },
            {
              $cond: [{ $gte: ["$publishAt", fortyEightHoursAgo] }, 200, 0],
            },
          ],
        },
      },
    },
    // Sort: highest trending score first
    { $sort: { trendingScore: -1, publishAt: -1 } },
    { $limit: limit },
    {
      $project: {
        title: 1,
        slug: 1,
        excerpt: 1,
        category: 1,
        visibility: 1,
        featuredImage: 1,
        isTrending: 1,
        trendingScore: 1,
        analytics: 1,
        publishAt: 1,
        createdAt: 1,
      },
    },
  ]);

  return JSON.parse(JSON.stringify(blogs));
}

/**
 * Latest blogs (for "Recent" section)
 */
export async function getLatestBlogs(limit = 3): Promise<TrendingBlog[]> {
  await dbConnect();

  const blogs = await Blog.find(
    { status: "published", visibility: { $in: ["public", "premium"] } },
    {
      title: 1, slug: 1, excerpt: 1, category: 1, visibility: 1,
      featuredImage: 1, isTrending: 1, analytics: 1, publishAt: 1, createdAt: 1,
    }
  )
    .sort({ publishAt: -1 })
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify(blogs));
}
