import dbConnect from "../mongoose";
import { BlogChunk, IBlogChunk } from "../models/BlogChunk";
import { IntelligenceEvent } from "../models/IntelligenceEvent";

export interface RetrievedKnowledge {
  blogId: string;
  slug: string;
  title: string;
  publishedAt: Date;
  content: string;
  score: number;
  isLive?: boolean;
  url?: string;
  sourceName?: string;
}

export async function findSemanticMatches(embedding: number[], limit: number = 5, threshold: number = 0.5): Promise<RetrievedKnowledge[]> {
  await dbConnect();

  // Using MongoDB Atlas Vector Search ($vectorSearch)
  // Requires an index named "vector_index" on the BlogChunk collection
  const pipeline = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 50, // Usually 10x limit
        limit: limit
      }
    },
    {
      $project: {
        blogId: 1,
        title: 1,
        slug: 1,
        publishedAt: 1,
        content: 1,
        score: { $meta: "vectorSearchScore" }
      }
    },
    {
      $match: {
        score: { $gte: threshold }
      }
    }
  ];

  const results = await BlogChunk.aggregate(pipeline);
  return results.map((res) => ({
    blogId: res.blogId.toString(),
    title: res.title,
    slug: res.slug,
    publishedAt: res.publishedAt,
    content: res.content,
    score: res.score
  }));
}

export async function findLiveSemanticMatches(embedding: number[], limit: number = 5, threshold: number = 0.5): Promise<RetrievedKnowledge[]> {
  await dbConnect();

  const pipeline = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: Math.max(50, limit * 10),
        limit: limit
      }
    },
    {
      $project: {
        eventId: "$_id",
        title: 1,
        slug: 1,
        publishedAt: 1,
        content: 1,
        sourceUrls: 1,
        sourceNames: 1,
        score: { $meta: "vectorSearchScore" }
      }
    },
    {
      $match: {
        score: { $gte: threshold }
      }
    }
  ];

  const results = await IntelligenceEvent.aggregate(pipeline);
  return results.map((res) => ({
    blogId: res.eventId.toString(), // mapping to blogId for compatibility with FormattedContext
    title: res.title,
    slug: res.slug,
    publishedAt: res.publishedAt,
    content: res.content,
    score: res.score,
    isLive: true,
    url: res.sourceUrls?.[0] || "",
    sourceName: res.sourceNames?.[0] || "Unknown Source"
  }));
}
