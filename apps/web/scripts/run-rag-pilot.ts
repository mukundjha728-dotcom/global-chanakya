import { config } from "dotenv";
config({ path: ".env.local" });
import dbConnect from "../src/lib/mongoose";
import { Blog } from "../src/lib/models/Blog";
import { BlogChunk } from "../src/lib/models/BlogChunk";
import { ContextBuilder } from "../src/lib/ai/contextBuilder";
const contextBuilder = new ContextBuilder();
import { ragIndexerService } from "../src/modules/intelligence/services/ragIndexer.service";
import { findSemanticMatches } from "../src/lib/ai/vectorSearch";
import { generateEmbeddings } from "../src/lib/ai/embeddings";
import { intelligenceService } from "../src/modules/intelligence/services/intelligence.service";

const TEST_QUERIES = [
  "How is India balancing its relations between the US and Russia?",
  "What is China's strategy in the Indo-Pacific?",
  "How does the Ukraine war impact global energy security?",
  "What are the key defense priorities for India?",
  "How is the Middle East conflict affecting global diplomacy?",
  "What is the significance of the Quad alliance?",
  "How is technology shaping modern warfare?",
  "What are the economic implications of the US-China rivalry?",
  "How is climate change impacting global security?",
  "What is India's role in the Global South?"
];

async function runPilot() {
  await dbConnect();
  console.log("=== Phase 3.1-B RAG Safe Pilot ===");

  // 1. Indexing Pilot Dataset
  const pilotBlogs = await Blog.find({ status: "published" }).sort({ publishedAt: -1 }).limit(15);
  console.log(`\nIndexing ${pilotBlogs.length} diverse blogs for the pilot...`);

  let totalChunks = 0;
  for (let i = 0; i < pilotBlogs.length; i++) {
    const blog = pilotBlogs[i];
    process.stdout.write(`[${i + 1}/${pilotBlogs.length}] ${blog.slug}... `);
    try {
      const res = await ragIndexerService.indexBlog(blog._id as string);
      if (res.success) {
        console.log(`✅ ${res.chunks} chunks`);
        totalChunks += res.chunks;
      } else {
        console.log(`❌ Failed: ${res.error}`);
      }
    } catch (e: any) {
      console.log(`❌ Error: ${e.message}`);
    }
  }

  console.log(`\nSuccessfully generated ${totalChunks} local 384-dimensional chunks.`);
  
  // Wait a few seconds for Atlas Vector Index to sync
  console.log("Waiting 10 seconds for MongoDB Atlas Vector Index to sync...");
  await new Promise(resolve => setTimeout(resolve, 10000));

  // 2. Retrieval Quality & Latency Tests
  console.log("\n=== Starting Retrieval & Latency Tests ===");
  
  const results = [];
  
  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const query = TEST_QUERIES[i];
    console.log(`\n[Query ${i + 1}/10]: "${query}"`);
    
    try {
      const t0 = performance.now();
      
      // Step A: Embed Query
      const queryEmbedding = await generateEmbeddings(query);
      const t1 = performance.now();
      
      // Step B: Vector Search
      const searchResults = await findSemanticMatches(queryEmbedding, 5, 0.0); // using 0 threshold for testing so we see what's returned
      const t2 = performance.now();
      
      // Step C: Groq Generation (using a simplified call to measure latency)
      // We will actually just measure the context building and retrieval here for strict RAG testing.
      const promptContext = ContextBuilder.build(searchResults);
      const t3 = performance.now();

      const embedLatency = t1 - t0;
      const searchLatency = t2 - t1;
      const totalLatency = t3 - t0;

      console.log(`  └─ Embedding: ${embedLatency.toFixed(2)}ms | Search: ${searchLatency.toFixed(2)}ms | Total RAG Prep: ${totalLatency.toFixed(2)}ms`);
      console.log(`  └─ Retrieved ${searchResults.length} chunks.`);
      
      if (searchResults.length > 0) {
        for (let j = 0; j < Math.min(3, searchResults.length); j++) {
          const chunk = searchResults[j] as any;
          console.log(`     - [Score: ${chunk.score?.toFixed(4) || 'N/A'}] Source: ${chunk.title}`);
        }
      } else {
        console.log("     ❌ NO CHUNKS RETRIEVED. Check Vector Index.");
      }
      
      results.push({
        query,
        retrieved: searchResults.length,
        embedLatency,
        searchLatency
      });

    } catch (e: any) {
      console.error(`  ❌ Error processing query: ${e.message}`);
    }
  }

  // Summary
  const avgEmbed = results.reduce((a, b) => a + b.embedLatency, 0) / results.length;
  const avgSearch = results.reduce((a, b) => a + b.searchLatency, 0) / results.length;
  
  console.log("\n=== Pilot Summary ===");
  console.log(`Queries Processed: ${results.length}`);
  console.log(`Average Warm Embedding Latency: ${avgEmbed.toFixed(2)}ms`);
  console.log(`Average Vector Search Latency: ${avgSearch.toFixed(2)}ms`);
  
  console.log("\nIf Vector Search Latency is very high or returned 0 chunks, ensure your Atlas Vector Index is configured with 384 dimensions.");
  process.exit(0);
}

runPilot();
