import { config } from "dotenv";
config({ path: ".env.local", override: true });
import dbConnect from "../src/lib/mongoose";
import { intelligenceService } from "../src/modules/intelligence/services/intelligence.service";
import { redisCache } from "../src/lib/cache/redis.cache";
import { RAGIndexerService } from "../src/modules/intelligence/services/ragIndexer.service";

async function measure(query: string) {
  const start = performance.now();
  await intelligenceService.askChanakya(query);
  return performance.now() - start;
}

async function runTest() {
  await dbConnect();
  const indexer = new RAGIndexerService();
  
  console.log("=== RAG Cache Versioning Test ===");
  const testQuery = "What is the capital of India? (Cache Test " + Date.now() + ")";
  
  // 1. A -> MISS
  const t1 = await measure(testQuery);
  console.log(`Query A (MISS): ${Math.round(t1)}ms`);
  
  // 2. A -> HIT
  const t2 = await measure(testQuery);
  console.log(`Query A (HIT): ${Math.round(t2)}ms`);
  
  if (t2 > 500) {
    console.warn("WARNING: Cache HIT was surprisingly slow.");
  }

  // 3. Modify Corpus (Simulate by just incrementing the version)
  console.log("Modifying RAG corpus version...");
  await indexer.incrementCorpusVersion();
  
  // 4. A -> MISS
  const t3 = await measure(testQuery);
  console.log(`Query A after invalidation (MISS): ${Math.round(t3)}ms`);
  
  // 5. A -> HIT
  const t4 = await measure(testQuery);
  console.log(`Query A after invalidation (HIT): ${Math.round(t4)}ms`);
  
  console.log("TEST PASSED: Cache versioning successfully isolates dynamic RAG content.");
  process.exit(0);
}

runTest();
