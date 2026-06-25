import dbConnect from "./mongoose";
import { Blog, IBlog } from "./models/Blog";
import mongoose from "mongoose";

export async function getRelatedArticles(
  sourceBlogId: string, 
  limit: number = 3
): Promise<IBlog[]> {
  await dbConnect();
  
  const sourceBlog = await Blog.findById(sourceBlogId).lean();
  if (!sourceBlog) return [];

  // Aggregation pipeline to find related articles
  // Prioritizes matching Entity Relations, then Tags, then Category
  const pipeline = [
    { $match: { _id: { $ne: new mongoose.Types.ObjectId(sourceBlogId) }, status: "published" } },
    {
      $addFields: {
        score: {
          $sum: [
            // +3 for each matching entity relation
            {
              $multiply: [
                { $size: { $setIntersection: ["$entityRelations.targetId", sourceBlog.entityRelations?.map((e: any) => e.targetId) || []] } },
                3
              ]
            },
            // +1 for each matching tag
            {
              $multiply: [
                { $size: { $setIntersection: [{ $ifNull: ["$tags", []] }, sourceBlog.tags || []] } },
                1
              ]
            },
            // +2 if same category
            {
              $cond: [{ $eq: ["$category", sourceBlog.category] }, 2, 0]
            }
          ]
        }
      }
    },
    { $match: { score: { $gt: 0 } } },
    { $sort: { score: -1, publishAt: -1 } },
    { $limit: limit }
  ];

  const related = await Blog.aggregate(pipeline as any[]);
  return related as IBlog[];
}
