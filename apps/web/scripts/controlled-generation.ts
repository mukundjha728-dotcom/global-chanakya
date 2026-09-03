import { config } from "dotenv";
config({ path: ".env.local" });
process.env.GROQ_DEFAULT_MODEL = "openai/gpt-oss-20b";
import dbConnect from "../src/lib/mongoose";
import { BlogPublishingRun } from "../src/lib/models/BlogPublishingRun";
import { blogPublishingEngine } from "../src/modules/blog/services/blogPublishingEngine.service";

async function runControlledTest() {
  await dbConnect();
  
  // Find the most recent run that contains cached research data
  const runs = await BlogPublishingRun.find().sort({ createdAt: -1 }).limit(10);
  let latestRun;
  let targetCategory;

  for (const r of runs) {
    targetCategory = r.categoryResults.find((c: any) => c.researchData && c.researchData.candidate);
    if (targetCategory) {
      latestRun = r;
      break;
    }
  }

  if (!latestRun || !targetCategory) {
    console.error("No previous run with cached research data found. Cannot perform controlled generation test without live Tavily.");
    process.exit(1);
  }

  console.log(`\n--- Starting Controlled Generation Test for Category: ${targetCategory.category} ---`);
  
  // Reset the status to PENDING so processNextPublication picks it up
  targetCategory.status = "PENDING";
  // Mark any other PENDING as FAILED so they are ignored in this run
  latestRun.categoryResults.forEach((c: any) => {
    if (c.category !== targetCategory.category && c.status === "PENDING") {
      c.status = "FAILED";
    }
  });

  latestRun.status = "QUEUED"; // Ensure the run is picked up
  await latestRun.save();

  try {
    const runRes = await blogPublishingEngine.processNextPublication(true); // isDryRun = true
    const metrics = blogPublishingEngine.lastMetrics;
    const data = blogPublishingEngine.lastRunData;
    
    console.log("\n--- TEST COMPLETED ---");
    console.log("Status:", runRes ? runRes.status : "Unknown");
    
    console.log("\n[METRICS]");
    console.log(`Tavily Calls: ${metrics.tavilyCalls} (Must be 0)`);
    console.log(`Groq Calls: ${metrics.groqCalls}`);
    console.log(`Successful Calls: ${metrics.successfulCalls}`);
    console.log(`Failed Calls: ${metrics.failedCalls}`);
    console.log(`429 Rate Limits: ${metrics.rateLimits}`);
    console.log(`Retries: ${metrics.retries}`);
    console.log(`Prompt Tokens: ${metrics.promptTokens}`);
    console.log(`Completion Tokens: ${metrics.completionTokens}`);
    console.log(`Average Successful Call Duration: ${metrics.successfulCalls > 0 ? Math.round((metrics.groqExecutionTimeMs / metrics.successfulCalls)) : 0}ms`);
    console.log(`Total Generation Time: ${Math.round(metrics.totalGenerationTimeMs / 1000)}s`);

    if (data && data.article) {
      console.log(`\n[ARTICLE]`);
      console.log(`Sections Generated: ${data.article.outline?.sections?.length || 0}`);
      console.log(`Final Word Count: ${data.article.actualWordCount}`);
      if (data.article.actualWordCount >= 5000) {
        console.log("Word Count Validation: PASS (>= 5000 words)");
      } else {
        console.log("Word Count Validation: FAIL (< 5000 words)");
      }
    } else {
      console.log("\n[ARTICLE]");
      console.log("Article Generation Failed or Aborted.");
      if (data && data.candidate) {
        console.log("Failed at a stage after candidate generation.");
      }
    }
    
    process.exit(0);
  } catch (e: any) {
    console.error("\n[CRITICAL ERROR] Controlled generation failed:");
    console.error(e);
    process.exit(1);
  }
}

runControlledTest();
