import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import dbConnect from "../src/lib/mongoose";
import { liveIngestionService } from "../src/lib/intelligence/live/ingestion.service";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

async function main() {
  await dbConnect();
  console.log("=== 5. LIVE INGESTION VERIFICATION ===");
  
  const initialCount = await IntelligenceEvent.countDocuments();
  console.log(`Initial Event Count: ${initialCount}`);

  console.log("Running liveIngestionService.pollAllProviders...");
  const result = await liveIngestionService.pollAllProviders();
  
  console.log("Poll Result:", result);

  const finalCount = await IntelligenceEvent.countDocuments();
  console.log(`Final Event Count: ${finalCount}`);
  
  const inserted = finalCount - initialCount;
  console.log(`Inserted Events: ${inserted}`);

  if (inserted > 0) {
    const latest = await IntelligenceEvent.find().sort({ createdAt: -1 }).limit(inserted).lean();
    for (const ev of latest) {
      console.log(`\nNew Event: ${ev.title}`);
      console.log(`Status: ${ev.status}`);
      console.log(`Enrichment Status: ${ev.enrichmentStatus}`);
      console.log(`Countries: ${(ev.countries || []).length}`);
      console.log(`Leaders: ${(ev.leaders || []).length}`);
      console.log(`Conflicts: ${(ev.conflicts || []).length}`);
      console.log(`Embedding Dimensions: ${ev.embedding?.length || 0}`);
      console.log(`Content Hash: ${ev.contentHash}`);
      console.log(`Slug: ${ev.slug}`);

      if (ev.status === "published" && ev.enrichmentStatus !== "COMPLETED") {
        console.error("FAIL: Published event without COMPLETED enrichment.");
      } else if (ev.enrichmentStatus === "FAILED" && ev.status !== "draft") {
        console.error("FAIL: Failed event not correctly set to draft/error.");
      }
    }
  }

  process.exit(0);
}

main().catch(console.error);
