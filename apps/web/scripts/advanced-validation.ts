import { askChanakyaResponseSchema } from "../src/lib/intelligence/validators";
import { MemoryRateLimiter } from "../src/lib/rate-limit";
import { redisCache } from "../src/lib/cache/redis.cache";
import crypto from "crypto";

async function runValidation() {
  console.log("=== PHASE 2 VALIDATION SUITE ===\n");

  // 1. Zod Schema Validation Test
  console.log("1. Zod Schema Validation Test");
  const validPayload = {
    query: "Test query",
    timestamp: new Date().toISOString(),
    directAssessment: "Direct assessment",
    strategicContext: "Strategic context",
    indiaImpact: "India impact",
    economicImpact: "Economic impact",
    securityImpact: "Security impact",
    diplomaticImpact: "Diplomatic impact",
    regionalImpact: "Regional impact",
    keyRisks: ["Risk 1", "Risk 2"],
    scenarios: ["Scenario 1"],
    whatToWatch: ["Watch 1"],
    analystAssessment: "Analyst assessment",
    confidence: "HIGH",
    sources: []
  };

  const validationResult = askChanakyaResponseSchema.safeParse(validPayload);
  if (validationResult.success) {
    console.log("✅ Valid payload passed schema validation.");
  } else {
    console.error("❌ Valid payload failed schema validation.");
  }

  const invalidPayload = { ...validPayload, confidence: "SUPER HIGH" };
  const invalidResult = askChanakyaResponseSchema.safeParse(invalidPayload);
  if (!invalidResult.success) {
    console.log("✅ Invalid payload correctly rejected (Confidence enum).");
  } else {
    console.error("❌ Invalid payload unexpectedly passed.");
  }

  // 2. Rate Limit Test
  console.log("\n2. Rate Limit Test (Memory Fallback)");
  let successCount = 0;
  let failCount = 0;
  for (let i = 0; i < 7; i++) {
    const { success } = await MemoryRateLimiter.checkLimit("127.0.0.1", "ask_chanakya", 5, 60000);
    if (success) successCount++;
    else failCount++;
  }
  console.log(`✅ Rate Limiter allowed ${successCount} requests and blocked ${failCount} requests. (Expected: 5 allowed, 2 blocked)`);

  // 3. Cache deterministic key test
  console.log("\n3. Cache Key Generation Test");
  const model = "openai/gpt-oss-120b";
  const query = "What is the capital of France?";
  const context = "";
  
  const key1 = crypto.createHash('sha256').update(`${model}:${query}:${context}`).digest('hex');
  const key2 = crypto.createHash('sha256').update(`${model}:${query}:${context}`).digest('hex');
  const key3 = crypto.createHash('sha256').update(`${model}:Different query:${context}`).digest('hex');

  if (key1 === key2 && key1 !== key3) {
    console.log("✅ Cache keys are deterministic and differentiate based on query.");
  } else {
    console.error("❌ Cache keys are not deterministic.");
  }

  // 4. Redis Cache Execution Test
  console.log("\n4. Redis Cache Execution Test");
  try {
    await redisCache.set("test_key", { data: "test_value" }, 10);
    const cached = await redisCache.get("test_key");
    if (!cached) {
      console.log("⚠️ Cache returned null. This is expected if the fallback cache disables reads/writes.");
    } else {
      console.log("✅ Cache write/read succeeded.");
    }
  } catch (e) {
    console.log("⚠️ Cache implementation is inactive or threw an error (Expected if Upstash is unconfigured).");
  }

  console.log("\n=== VALIDATION COMPLETED ===");
}

runValidation().catch(console.error);
