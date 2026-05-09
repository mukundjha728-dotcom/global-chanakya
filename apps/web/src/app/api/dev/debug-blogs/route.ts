import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    // All published blogs (raw)
    const allPublished = await Blog.find(
      { status: "published" },
      { title: 1, visibility: 1, status: 1, publishAt: 1, "analytics.views": 1, isTrending: 1 }
    ).sort({ "analytics.views": -1 }).lean();

    // Trending query result
    const now = new Date();
    const trendingAgg = await Blog.aggregate([
      { $match: { status: "published", visibility: { $in: ["public", "premium", "private"] } } },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$analytics.views", 1] },
              { $multiply: ["$analytics.likes", 3] },
              { $multiply: ["$analytics.bookmarks", 2] },
              { $cond: ["$isTrending", 500, 0] },
            ],
          },
        },
      },
      { $sort: { trendingScore: -1 } },
      { $limit: 10 },
      { $project: { title: 1, visibility: 1, status: 1, "analytics.views": 1, isTrending: 1, trendingScore: 1, publishAt: 1 } },
    ]);

    return NextResponse.json({
      serverTime: now.toISOString(),
      totalPublished: allPublished.length,
      allPublished,
      trendingAggResult: trendingAgg,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
