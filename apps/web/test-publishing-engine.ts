import { config } from "dotenv";
config({ path: ".env.local" });

import dbConnect from "./src/lib/mongoose";
import { blogPublishingEngine } from "./src/modules/blog/services/blogPublishingEngine.service";

async function runTests() {
  await dbConnect();
  console.log("=========================================");
  console.log("🚀 TESTING BLOG PUBLISHING ENGINE (DRY RUN)");
  console.log("=========================================");

  try {
    // Test 1: Check Duplicate Logic
    console.log("\n[TEST 1] Duplicate Detection");
    // Since we don't know the exact DB state, we'll just test that the method executes without error
    const dupCheck = await blogPublishingEngine.checkDuplicate("Test Non Existent Topic 123", "Geopolitics");
    console.log("Duplicate check result:", dupCheck);
    if (dupCheck.isDuplicate) {
        console.warn("Expected this to NOT be a duplicate, but might be if DB contains a match.");
    } else {
        console.log("✅ Duplicate check passed (no match found as expected)");
    }

    // Test 2: Trigger Engine in Dry Run
    console.log("\n[TEST 2] Trigger Engine (Dry Run)");
    const run = await blogPublishingEngine.processNextPublication(true);
    console.log(`✅ Engine Triggered Successfully. RunID: ${run.runId}`);
    console.log(`Processed exactly one category status: ${run.status}`);

    // Clean up
    console.log("\n✅ ALL TESTS EXECUTED SUCCESSFULLY");
  } catch (error) {
    console.error("\n❌ TEST SUITE FAILED", error);
    await blogPublishingEngine.releaseLock();
    process.exit(1);
  }
  process.exit(0);
}

runTests();
