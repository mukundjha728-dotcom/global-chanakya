/**
 * clustering.ts
 * Groups entities and articles into high-level authority clusters (e.g., BRICS, Indo-Pacific).
 */
import dbConnect from "../mongoose";
import { Blog } from "../models/Blog";

export interface TopicCluster {
  id: string;
  name: string;
  articleCount: number;
  latestArticles: any[];
  topEntities: string[];
}

export async function generateClusters(): Promise<TopicCluster[]> {
  await dbConnect();

  // Aggregation to dynamically find the most common strategic clusters
  const pipeline = [
    { $match: { status: "published" } },
    { $unwind: "$tags" },
    { $group: {
        _id: "$tags",
        articleCount: { $sum: 1 },
        articles: { $push: { title: "$title", slug: "$slug", publishAt: "$publishAt" } },
        entities: { $push: "$entityRelations.targetId" }
      }
    },
    { $match: { articleCount: { $gte: 3 } } }, // Only consider it a cluster if it has 3+ articles
    { $sort: { articleCount: -1 } },
    { $limit: 10 }
  ];

  const results = await Blog.aggregate(pipeline);

  return results.map(r => ({
    id: r._id,
    name: r._id,
    articleCount: r.articleCount,
    latestArticles: r.articles.sort((a: any, b: any) => b.publishAt - a.publishAt).slice(0, 5),
    topEntities: [...new Set(r.entities.flat())].slice(0, 5) // Extract unique entity IDs
  }));
}
