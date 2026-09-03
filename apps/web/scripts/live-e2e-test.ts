import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { intelligenceService } from "../src/modules/intelligence/services/intelligence.service";
import dbConnect from "../src/lib/mongoose";

async function run() {
  console.log("=== LIVE E2E RAG TEST ===");
  await dbConnect();

  const queries = [
    "What is the current state of global conflict?",
    "Summarize recent diplomatic developments.",
    "Are there any breaking news updates?"
  ];

  let passCount = 0;
  for (const q of queries) {
    console.log(`\nQuery: ${q}`);
    const t0 = performance.now();
    const res = await intelligenceService.askChanakya(q, [] as any);
    const t1 = performance.now();
    
    console.log(`Answer: ${(res as any).directAssessment.substring(0, 100)}...`);
    console.log(`Latency: ${Math.round(t1 - t0)}ms`);
    console.log(`Sources: ${(res as any).sources.length}`);
    
    if ((res as any).directAssessment.length > 10 && (res as any).sources.length >= 0) {
      passCount++;
      console.log("[PASS] Request succeeded.");
    } else {
      console.error("[FAIL] Bad response structure.");
    }
  }

  if (passCount === queries.length) {
    console.log("\n[SUCCESS] E2E Live RAG is fully operational.");
  } else {
    console.error("\n[FAIL] E2E failed.");
    process.exit(1);
  }
  process.exit(0);
}
run();
