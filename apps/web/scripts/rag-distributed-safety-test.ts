import { config } from "dotenv";
config({ path: ".env.local", override: true });
import dbConnect from "../src/lib/mongoose";
import { Blog } from "../src/lib/models/Blog";
import { BlogChunk } from "../src/lib/models/BlogChunk";
import { RAGIndexerService } from "../src/modules/intelligence/services/ragIndexer.service";

async function runTest() {
  await dbConnect();
  const indexer = new RAGIndexerService();

  console.log("=== RAG Distributed Safety (Concurrency) Test ===");
  const blog = await Blog.findOne({ isPublished: true });
  if (!blog) {
    console.log("No published blog found for testing.");
    process.exit(1);
  }

  console.log(`Testing concurrency on blog: ${blog.title} (${blog._id})`);
  
  // Wipe current chunks for this blog to test pure concurrent creation
  await BlogChunk.deleteMany({ blogId: blog._id });
  console.log("Cleared existing chunks for clean test.");

  // Fire 5 concurrent requests
  console.log("Firing 5 concurrent indexBlog() calls...");
  const results = await Promise.all([
    indexer.indexBlog(blog._id),
    indexer.indexBlog(blog._id),
    indexer.indexBlog(blog._id),
    indexer.indexBlog(blog._id),
    indexer.indexBlog(blog._id)
  ]);

  console.log("Concurrency results:", results);

  const chunks = await BlogChunk.find({ blogId: blog._id }).sort({ chunkIndex: 1 });
  console.log(`Resulting chunks in DB: ${chunks.length}`);
  
  let duplicateCount = 0;
  const seenIndexes = new Set();
  for (const chunk of chunks) {
    if (chunk.embedding.length !== 384) {
      console.error(`ERROR: Chunk ${chunk.chunkIndex} has invalid embedding length ${chunk.embedding.length}`);
      process.exit(1);
    }
    if (seenIndexes.has(chunk.chunkIndex)) {
      duplicateCount++;
    }
    seenIndexes.add(chunk.chunkIndex);
  }

  if (duplicateCount > 0) {
    console.error(`TEST FAILED: Found ${duplicateCount} duplicate chunks.`);
    process.exit(1);
  }

  if (chunks.length === 0) {
    console.error("TEST FAILED: No chunks created.");
    process.exit(1);
  }

  console.log("TEST PASSED: Exactly one valid chunk set survived the race condition.");
  process.exit(0);
}

runTest();
