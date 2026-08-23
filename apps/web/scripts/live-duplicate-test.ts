import { config } from "dotenv";
config({ path: ".env.local", override: true });
import dbConnect from "../src/lib/mongoose";
import { liveIngestionService } from "../src/lib/intelligence/live/ingestion.service";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

async function run() {
  console.log("=== LIVE DUPLICATE TEST ===");
  await dbConnect();
  
  const countBefore = await IntelligenceEvent.countDocuments();
  console.log(`Events before: ${countBefore}`);

  console.log("Running second ingestion (should all be exact deduplicated)...");
  const stats = await liveIngestionService.pollAllProviders();
  console.log("Second Ingestion Stats:", stats);

  const countAfter = await IntelligenceEvent.countDocuments();
  console.log(`Events after: ${countAfter}`);

  if (countBefore === countAfter && stats.inserted === 0 && stats.duplicates > 0) {
    console.log("[PASS] Duplicate detection working perfectly.");
  } else {
    console.error("[FAIL] Duplicate detection failed.");
    process.exit(1);
  }
  process.exit(0);
}
run();
