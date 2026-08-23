import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { intelligenceService } from '../src/modules/intelligence/services/intelligence.service';
import { ragIndexerService } from '../src/modules/intelligence/services/ragIndexer.service';
import dbConnect from '../src/lib/mongoose';
import { Blog } from '../src/lib/models/Blog';
import { BlogChunk } from '../src/lib/models/BlogChunk';

async function runTests() {
  await dbConnect();

  console.log("=== CACHE REGRESSION TEST ===");
  const testQuery = "What is the strategic significance of the Indian Ocean?";
  
  console.log("1. Querying for the first time (Expect CACHE MISS)...");
  const t1 = performance.now();
  await intelligenceService.askChanakya(testQuery);
  const latency1 = performance.now() - t1;
  console.log(`Latency 1: ${latency1.toFixed(0)}ms`);

  console.log("2. Querying for the second time (Expect CACHE HIT)...");
  const t2 = performance.now();
  await intelligenceService.askChanakya(testQuery);
  const latency2 = performance.now() - t2;
  console.log(`Latency 2: ${latency2.toFixed(0)}ms`);

  if (latency2 > 500) {
    console.error("❌ Cache Hit failed. Latency too high for a memory hit.");
  } else {
    console.log("✅ Cache Hit succeeded. Bypassed network/embeddings.");
  }

  console.log("\n=== BLOG LIFECYCLE SYNC TEST ===");
  
  // Find a test blog
  const blog = await Blog.findOne({ status: "published" });
  if (!blog) {
    console.log("No published blog found. Skipping lifecycle test.");
    process.exit(0);
  }

  console.log(`Using Blog: ${blog.slug}`);
  const initialChunks = await BlogChunk.countDocuments({ blogId: blog._id });
  console.log(`Initial chunk count: ${initialChunks}`);

  // Modify content and trigger indexing directly (as if from route)
  console.log("Updating blog content to trigger re-index...");
  const oldContent = blog.content;
  blog.content = oldContent + "\n\n(Added test content)";
  await blog.save();

  console.log("Triggering indexBlog()...");
  const result = await ragIndexerService.indexBlog(blog._id);
  console.log(`Index result: ${JSON.stringify(result)}`);

  const newChunks = await BlogChunk.countDocuments({ blogId: blog._id });
  console.log(`New chunk count: ${newChunks}`);
  
  const testChunk = await BlogChunk.findOne({ blogId: blog._id, content: { $regex: "Added test content" }});
  if (testChunk) {
    console.log("✅ New chunks exist and contain new content.");
  } else {
    console.error("❌ New chunks do not reflect updated content.");
  }

  // Restore
  console.log("Restoring original blog content...");
  blog.content = oldContent;
  await blog.save();
  await ragIndexerService.indexBlog(blog._id);
  console.log("✅ Restored original content.");
  
  process.exit(0);
}

runTests().catch(console.error);
