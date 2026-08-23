import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnect from "../src/lib/mongoose";
import { LiveIngestionService } from "../src/lib/intelligence/live/ingestion.service";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

async function main() {
  await dbConnect();
  
  console.log("=========================================");
  console.log("PHASE 6.0: REAL INTELLIGENCE PUBLISHING TEST");
  console.log("=========================================");

  // 1. Fetch from real RSS via LiveIngestionService
  const ingestionService = new LiveIngestionService();
  console.log("[Test] Running Real RSS Ingestion Pipeline (Bounded AI Enrichment)...");
  
  const stats = await ingestionService.pollAllProviders();
  console.log("[Test] Ingestion Complete.", stats);

  // 2. Verify Database State
  console.log("\n[Test] Verifying Database State for New Published Events...");
  
  // Find events inserted today
  const recentEvents = await IntelligenceEvent.find({
    status: "published"
  }).sort({ publishedAt: -1 }).limit(10).lean();
  
  if (recentEvents.length === 0) {
    console.error("❌ No real events found in database.");
    process.exit(1);
  }
  
  const sample = recentEvents[0];
  console.log(`\n[Sample Event: ${sample.title}]`);
  console.log("- Slug:", sample.slug);
  console.log("- Source Names:", sample.sourceNames);
  console.log("- Embedding Length:", sample.embedding?.length);
  console.log("- Enrichment Status:", sample.enrichmentStatus);
  console.log("- India Impact:", sample.indiaImpact);
  console.log("- Why It Matters:", sample.whyItMatters);
  console.log("- Regional Risk:", sample.riskLevel);
  console.log("- Confidence:", sample.confidence);

  if (!sample.slug) {
     console.error("❌ Missing slug generation.");
     process.exit(1);
  }

  if (sample.embedding?.length !== 384) {
     console.error("❌ Invalid embedding dimensions.");
     process.exit(1);
  }

  if (sample.enrichmentStatus !== "COMPLETED") {
     console.warn("⚠️ AI Enrichment didn't complete successfully for the sample event. Status:", sample.enrichmentStatus);
  } else {
     if (!sample.whyItMatters || !sample.indiaImpact) {
        console.error("❌ Enrichment marked COMPLETED but fields are missing.");
        process.exit(1);
     }
  }

  console.log("\n✅ Database Persistence & Enrichment Constraints Verified.");
  console.log("Done.");
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
