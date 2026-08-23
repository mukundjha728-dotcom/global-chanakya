import { config } from "dotenv";
config({ path: ".env.local", override: true });
import dbConnect from "../src/lib/mongoose";
import { Blog } from "../src/lib/models/Blog";
import { BlogChunk } from "../src/lib/models/BlogChunk";
import { RAGIndexerService } from "../src/modules/intelligence/services/ragIndexer.service";

async function runTest() {
  await dbConnect();
  const indexer = new RAGIndexerService();
  console.log("=== RAG Lifecycle Regression ===");

  const author = await import("../src/lib/models/User").then(m => m.User.findOne());
  if (!author) {
    console.log("No user found.");
    process.exit(1);
  }

  // 1. CREATE published
  const blog = new Blog({
    title: "Test RAG Lifecycle Blog " + Date.now(),
    slug: "test-rag-lifecycle-" + Date.now(),
    excerpt: "This is a test excerpt.",
    content: "This is the initial content of the test blog. It has some distinct words like ALPHABRAVOCHARLIE.",
    category: "Geopolitics",
    author: author._id,
    status: "published"
  });
  await blog.save();
  console.log("Created test blog:", blog._id.toString());

  await indexer.indexBlog(blog._id);
  
  let chunks = await BlogChunk.find({ blogId: blog._id });
  console.log(`Chunks after CREATE: ${chunks.length}`);
  if (chunks.length === 0) {
    console.error("FAILED: Chunks not created.");
    process.exit(1);
  }
  const originalChunkId = chunks[0]._id.toString();

  // 2. UPDATE (triggers re-index)
  blog.content = "This is the updated content. ALPHABRAVOCHARLIE has changed to DELTAECHOGOLF.";
  await blog.save();
  await indexer.indexBlog(blog._id);

  chunks = await BlogChunk.find({ blogId: blog._id });
  console.log(`Chunks after UPDATE: ${chunks.length}`);
  if (chunks.length === 0 || chunks[0]._id.toString() === originalChunkId) {
    console.error("FAILED: Old chunks were not replaced.");
    process.exit(1);
  }

  // 3. UNPUBLISH
  blog.status = "draft";
  await blog.save();
  // The system's unindex hook is typically called manually or via webhook.
  // We will call the indexer's sync manually as if the API did it:
  await indexer.unindexBlog(blog._id);

  chunks = await BlogChunk.find({ blogId: blog._id });
  console.log(`Chunks after UNPUBLISH: ${chunks.length}`);
  if (chunks.length > 0) {
    console.error("FAILED: Chunks remain after unpublish.");
    process.exit(1);
  }

  // 4. REPUBLISH
  blog.status = "published";
  await blog.save();
  await indexer.indexBlog(blog._id);
  
  chunks = await BlogChunk.find({ blogId: blog._id });
  console.log(`Chunks after REPUBLISH: ${chunks.length}`);
  if (chunks.length === 0) {
    console.error("FAILED: Chunks not recreated.");
    process.exit(1);
  }

  // 5. DELETE
  await Blog.deleteOne({ _id: blog._id });
  await indexer.unindexBlog(blog._id);

  chunks = await BlogChunk.find({ blogId: blog._id });
  console.log(`Chunks after DELETE: ${chunks.length}`);
  if (chunks.length > 0) {
    console.error("FAILED: Orphan chunks remain after delete.");
    process.exit(1);
  }

  console.log("TEST PASSED: Blog lifecycle perfectly synchronizes with RAG chunks.");
  process.exit(0);
}

runTest();
