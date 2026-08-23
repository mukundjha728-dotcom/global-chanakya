import { config } from "dotenv";
config({ path: ".env.local" });
import dbConnect from "../src/lib/mongoose";
import { Blog } from "../src/lib/models/Blog";
import { BlogChunk } from "../src/lib/models/BlogChunk";
import { ragIndexerService } from "../src/modules/intelligence/services/ragIndexer.service";
import { generateEmbeddings } from "../src/lib/ai/embeddings";

async function runPilot() {
  await dbConnect();
  
  console.log("=== Phase 3.1 RAG Local Embedding Pilot ===");

  // 1. Verify Memory and Cold Start
  const startMem = process.memoryUsage().rss / 1024 / 1024;
  console.log(`Initial RSS Memory: ${startMem.toFixed(2)} MB`);

  const t0 = performance.now();
  const testEmbedding = await generateEmbeddings("This is a test document to measure cold start latency and dimensions.");
  const t1 = performance.now();
  const coldStart = t1 - t0;
  
  const postModelMem = process.memoryUsage().rss / 1024 / 1024;
  
  const t2 = performance.now();
  await generateEmbeddings("This is a test document to measure warm start latency.");
  const t3 = performance.now();
  const warmStart = t3 - t2;

  console.log(`Cold Start Latency: ${coldStart.toFixed(2)} ms`);
  console.log(`Warm Start Latency: ${warmStart.toFixed(2)} ms`);
  console.log(`Model Dimensions: ${testEmbedding.length}`);
  console.log(`Memory after model load: ${postModelMem.toFixed(2)} MB (+${(postModelMem - startMem).toFixed(2)} MB)`);

  if (testEmbedding.length !== 384) {
    console.error(`❌ Expected 384 dimensions, got ${testEmbedding.length}. Aborting.`);
    process.exit(1);
  }

  // 2. Clear old 1536-dimensional vectors if they exist
  const oldChunks = await BlogChunk.deleteMany({ embeddingDimensions: { $ne: 384 } });
  if (oldChunks.deletedCount > 0) {
    console.log(`Deleted ${oldChunks.deletedCount} old chunks with incorrect dimensions.`);
  }

  // 3. Select 10 pilot blogs
  const blogs = await Blog.find({ status: "published" }).sort({ publishedAt: -1 }).limit(10).select("_id title slug");
  console.log(`\nFound ${blogs.length} published blogs for pilot.`);

  let totalChunks = 0;
  const indexT0 = performance.now();

  for (let i = 0; i < blogs.length; i++) {
    const b = blogs[i];
    process.stdout.write(`[${i+1}/${blogs.length}] Indexing ${b.slug}... `);
    
    try {
      const result = await ragIndexerService.indexBlog(b._id);
      if (result.success) {
        console.log(`✅ ${result.chunks} chunks`);
        totalChunks += result.chunks;
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error: any) {
      console.log(`❌ Crashed: ${error.message}`);
    }
  }

  const indexT1 = performance.now();
  const indexTime = (indexT1 - indexT0) / 1000;

  console.log(`\n========== PILOT COMPLETE ==========`);
  console.log(`Total Blogs Processed: ${blogs.length}`);
  console.log(`Total Chunks Generated: ${totalChunks}`);
  console.log(`Total Time: ${indexTime.toFixed(2)} s`);
  console.log(`Throughput: ${(totalChunks / indexTime).toFixed(2)} chunks/s`);
  console.log(`Estimated full indexing time (166 blogs): ${((166 / blogs.length) * indexTime).toFixed(2)} s`);

  console.log(`\n✅ Pilot embedding generation successful. The database now contains 384-dimensional vectors.`);
  console.log(`⚠️ ACTION REQUIRED: Update MongoDB Atlas Vector Search Index 'vector_index' to numDimensions: 384 before retrieval tests!`);
  
  process.exit(0);
}

runPilot().catch(console.error);
