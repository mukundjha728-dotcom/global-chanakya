import { config } from "dotenv";
config({ path: ".env.local", override: true });
import dbConnect from "../src/lib/mongoose";
import { intelligenceService } from "../src/modules/intelligence/services/intelligence.service";
import { redisCache } from "../src/lib/cache/redis.cache";

async function runTest() {
  await dbConnect();
  // bypass cache by invalidating version
  const { SystemConfig } = await import("../src/lib/models/SystemConfig");
  await SystemConfig.findOneAndUpdate(
    { isActive: true },
    { $inc: { ragCorpusVersion: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("=== RAG E2E Performance ===");
  const queries = [
    "What is the impact of semiconductor decoupling on India?",
    "How does the US election affect global markets?",
    "Analyze the latest GDP growth numbers for Southeast Asia.",
    "What are the key risks in the Middle East right now?",
    "How is China's tech regulation evolving?",
    "What are the implications of the European Green Deal for trade?",
    "Assess the strategic partnership between India and Japan.",
    "How are supply chains shifting away from China?",
    "What is the role of the Quad in the Indo-Pacific?",
    "Analyze the future of AI regulation globally."
  ];

  let totals = [];
  for (const q of queries) {
    const start = performance.now();
    try {
      await intelligenceService.askChanakya(q);
      const latency = performance.now() - start;
      console.log(`Query: ${q.substring(0, 30)}... | Latency: ${Math.round(latency)}ms`);
      totals.push(latency);
    } catch (e: any) {
      console.log(`Query failed: ${e.message}`);
    }
  }

  if (totals.length > 0) {
    totals.sort((a,b) => a-b);
    const p50 = totals[Math.floor(totals.length * 0.5)];
    const p95 = totals[Math.floor(totals.length * 0.95)];
    const avg = totals.reduce((a,b)=>a+b, 0) / totals.length;
    console.log(`\nMetrics (n=${totals.length}):`);
    console.log(`P50: ${Math.round(p50)}ms`);
    console.log(`P95: ${Math.round(p95)}ms`);
    console.log(`Avg: ${Math.round(avg)}ms`);
    console.log(`Min: ${Math.round(totals[0])}ms`);
    console.log(`Max: ${Math.round(totals[totals.length - 1])}ms`);
  }
  process.exit(0);
}
runTest();
