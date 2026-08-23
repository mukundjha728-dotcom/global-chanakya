import { config } from "dotenv";
config({ path: ".env.local", override: true });
import mongoose from "mongoose";
import { Blog } from "../src/lib/models/Blog";
import { BlogChunk } from "../src/lib/models/BlogChunk";
import { MarkdownSplitter } from "../src/lib/ai/textSplitter";
import { generateEmbeddings } from "../src/lib/ai/embeddings";
import dbConnect from "../src/lib/mongoose";

const BATCH_SIZE = 5;

async function runIndexer() {
  await dbConnect();
  const db = mongoose.connection.db;
  if (!db) throw new Error("No DB");
  
  console.log("Connected to MongoDB.");

  interface MongoSearchIndex {
    name: string;
    status: string;
    latestDefinition?: {
      fields?: Array<{
        numDimensions?: number;
      }>;
    };
  }

  // Check vector index
  const indexes = await db.collection("blogchunks").listSearchIndexes().toArray() as unknown as MongoSearchIndex[];
  const vectorIndex = indexes.find(i => i.name === "vector_index");
  if (!vectorIndex) throw new Error("vector_index is missing on blogchunks collection");
  if (vectorIndex.status !== "READY") throw new Error("vector_index is not READY");
  
  const dims = vectorIndex.latestDefinition?.fields?.[0]?.numDimensions;
  if (dims !== 384) throw new Error("Invalid vector index dimensions");

  // Get all published blogs
  const publishedBlogs = await Blog.find({ status: "published" });
  console.log(`Total Published Blogs: ${publishedBlogs.length}`);
  
  const results = {
    success: 0,
    skipped: 0,
    failed: [] as string[]
  };

  for (let i = 0; i < publishedBlogs.length; i += BATCH_SIZE) {
    const batch = publishedBlogs.slice(i, i + BATCH_SIZE);
    
    // Process batch in parallel or sequentially. We will do sequentially to strictly bound memory.
    for (const blog of batch) {
      try {
        const contentToHash = `${blog.title}\n${blog.content}`;
        const exactHash = MarkdownSplitter.generateHash(contentToHash);
        
        // Idempotency Check
        const existingChunks = await BlogChunk.find({ blogId: blog._id });
        if (existingChunks.length > 0) {
          const isFullyIndexed = existingChunks.every(c => 
            c.contentHash === exactHash && 
            c.embeddingModel === "Xenova/all-MiniLM-L6-v2" && 
            c.embeddingDimensions === 384 &&
            c.embedding && c.embedding.length === 384
          );
          
          if (isFullyIndexed) {
            console.log(`[${i + batch.indexOf(blog) + 1}/${publishedBlogs.length}] SKIP — already indexed: ${blog.slug}`);
            results.skipped++;
            continue;
          }
        }
        
        // Generate and Validate New Chunks
        let fullContent = blog.content;
        if (blog.keyInsights && blog.keyInsights.length > 0) {
          fullContent += `\n\n## Key Insights\n${blog.keyInsights.join("\n")}`;
        }
        
        const rawChunks = MarkdownSplitter.splitText(fullContent, 800);
        const blogChunksToInsert = [];
        
        for (let j = 0; j < rawChunks.length; j++) {
          const chunk = rawChunks[j];
          const stringToEmbed = `Title: ${blog.title}\nCategory: ${blog.category}\n\n${chunk.content}`;
          const embedding = await generateEmbeddings(stringToEmbed);
          
          // Validation
          if (!embedding || embedding.length !== 384) throw new Error("Invalid embedding dimensions");
          if (!chunk.content || chunk.content.trim() === "") throw new Error("Empty chunk content");
          
          blogChunksToInsert.push({
            blogId: blog._id,
            slug: blog.slug,
            title: blog.title,
            publishedAt: blog.publishedAt || blog.createdAt,
            chunkIndex: j,
            content: chunk.content,
            embedding: embedding,
            embeddingModel: "Xenova/all-MiniLM-L6-v2",
            embeddingDimensions: 384,
            contentHash: exactHash,
            metadata: {
              ...chunk.metadata,
              category: blog.category,
              tags: blog.tags
            }
          });
        }
        
        // Safe Blog Replacement
        if (blogChunksToInsert.length > 0) {
          await BlogChunk.deleteMany({ blogId: blog._id });
          await BlogChunk.insertMany(blogChunksToInsert);
        }
        
        console.log(`[${i + batch.indexOf(blog) + 1}/${publishedBlogs.length}] INDEXED — ${blogChunksToInsert.length} chunks: ${blog.slug}`);
        results.success++;
        
      } catch (e: any) {
        console.log(`[${i + batch.indexOf(blog) + 1}/${publishedBlogs.length}] FAILED — ${blog.slug}: ${e.message}`);
        results.failed.push(blog.slug);
      }
    }
  }
  
  console.log("\n=== FINAL STATUS ===");
  console.log(`SUCCESS: ${results.success}`);
  console.log(`SKIPPED: ${results.skipped}`);
  console.log(`FAILED: ${results.failed.length}`);
  if (results.failed.length > 0) {
    console.log("Failed Slugs:", results.failed.join(", "));
  }
  
  mongoose.connection.close();
}

runIndexer().catch(e => {
  console.error("Fatal Error:", e);
  process.exit(1);
});
