/**
 * semanticRecommendations.ts
 * Uses vector similarity to fetch highly intelligent recommendations.
 */
import { Blog, IBlog } from "../models/Blog";
import { findSemanticMatches } from "./vectorSearch";

export async function getSemanticRecommendations(sourceBlogId: string, limit: number = 3): Promise<IBlog[]> {
  const blog = await Blog.findById(sourceBlogId).select("embedding").lean();
  
  // Fallback to legacy tag-based engine if embeddings aren't generated yet
  if (!blog || !blog.embedding || blog.embedding.length === 0) {
    const { getRelatedArticles } = await import("../recommendation");
    return getRelatedArticles(sourceBlogId, limit);
  }

  // Vector similarity search
  const matches = await findSemanticMatches(blog.embedding, limit + 1, 0.75);
  
  // Filter out the source blog itself
  const filtered = matches.filter(m => m._id.toString() !== sourceBlogId).slice(0, limit);
  
  return filtered as IBlog[];
}
