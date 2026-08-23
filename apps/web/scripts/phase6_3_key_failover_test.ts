

import { GroqKeyManager } from "../src/lib/ai/groqKeyManager";
import { groqProvider } from "../src/lib/ai/providers/groq.provider";
import { z } from "zod";
import { redis } from "../src/lib/redis";

async function run() {
  console.log("=== PHASE 6.3 KEY FAILOVER & DEMAND REFRESH AUDIT ===");

  // 1. Initial State
  const initialHealth = await GroqKeyManager.getHealthReport();
  console.log("\n1. Initial Groq Health:");
  console.log(JSON.stringify(initialHealth, null, 2));

  if (initialHealth.totalKeys < 5) {
    console.error("❌ Expected 5 keys in the pool. Found:", initialHealth.totalKeys);
    process.exit(1);
  } else {
    console.log("✅ 5 keys found in the pool.");
  }

  // 2. Simulate Provider Usage (Happy Path)
  console.log("\n2. Simulating successful Groq call...");
  const dummySchema = z.object({ success: z.boolean() });
  
  try {
    const res = await groqProvider.generateStructured({
      model: "llama-3.1-8b-instant",
      systemPrompt: "You are a helpful assistant.",
      userPrompt: "Reply strictly with {\"success\": true}",
      schema: dummySchema,
      schemaName: "DummySchema",
      temperature: 0,
      maxTokens: 50
    });
    console.log("Response:", res.data);
    console.log("✅ Generation successful.");
  } catch (e: any) {
    console.error("❌ Generation failed:", e.message);
  }

  const postSuccessHealth = await GroqKeyManager.getHealthReport();
  console.log("\nPost-Success Health:");
  console.log(JSON.stringify(postSuccessHealth.details, null, 2));

  // 3. Simulate Rate Limit (429) marking
  console.log("\n3. Simulating a Rate Limit Failure on groq-1...");
  await GroqKeyManager.markRateLimited("groq-1", 5000); // 5s cooldown
  const postLimitHealth = await GroqKeyManager.getHealthReport();
  console.log("Post-Limit groq-1 details:", postLimitHealth.details.find(d => d.id === "groq-1"));

  const nextKey = await GroqKeyManager.getAvailableKey();
  console.log("Next available key after rate limit on groq-1:", nextKey?.id);
  if (nextKey?.id === "groq-1") {
    console.error("❌ groq-1 should be in cooldown, but it was selected.");
  } else {
    console.log("✅ Rotation skipped groq-1 successfully.");
  }

  // 4. Test Demand Refresh Lock
  console.log("\n4. Testing Demand Refresh Lock...");
  const LOCK_KEY = "intelligence:demand-refresh-lock";
  const LAST_SUCCESS_KEY = "intelligence:last-successful-ingestion";
  
  // Clear any existing
  await redis.del(LOCK_KEY);
  await redis.del(LAST_SUCCESS_KEY);
  
  const { ensureFreshLiveIntelligence, markIngestionComplete } = require("../src/lib/intelligence/live/demandRefresh");
  
  // First call should acquire lock
  await ensureFreshLiveIntelligence();
  const lockStatus = await redis.get(LOCK_KEY);
  if (lockStatus === "LOCKED") {
    console.log("✅ Demand refresh acquired lock.");
  } else {
    console.error("❌ Failed to acquire lock on first call.");
  }

  // Simulate complete
  await markIngestionComplete();
  const lockAfter = await redis.get(LOCK_KEY);
  if (!lockAfter) {
    console.log("✅ Lock released after markIngestionComplete.");
  } else {
    console.error("❌ Lock was not released.");
  }

  // Reset health for tests
  await redis.del("groq:key-health:groq-1");
  console.log("\n✅ Phase 6.3 validation complete.");
  process.exit(0);
}

run().catch(console.error);
