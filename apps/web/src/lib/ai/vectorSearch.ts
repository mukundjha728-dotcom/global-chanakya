/**
 * vectorSearch.ts
 * Queries MongoDB Atlas Vector Search indices to find similar entities.
 */
import dbConnect from "../mongoose";
import { Blog } from "../models/Blog";

export async function findSemanticMatches(embedding: number[], limit: number = 3, threshold: number = 0.7) {
  await dbConnect();

  // Using MongoDB Atlas Vector Search ($vectorSearch)
  // Requires an index named "vector_index" on the target collection
  const pipeline = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 100,
        limit: limit
      }
    },
    {
      $project: {
        title: 1,
        slug: 1,
        category: 1,
        score: { $meta: "vectorSearchScore" }
      }
    },
    {
      $match: {
        score: { $gte: threshold }
      }
    }
  ];

  return await Blog.aggregate(pipeline);
}
