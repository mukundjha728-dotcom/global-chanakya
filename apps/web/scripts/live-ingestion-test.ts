import { config } from "dotenv";
config({ path: ".env.local", override: true });
import dbConnect from "../src/lib/mongoose";
import { liveIngestionService } from "../src/lib/intelligence/live/ingestion.service";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

async function run() {
  console.log("=== LIVE INGESTION TEST ===");
  await dbConnect();
  
  // Wipe existing for clean test
  await IntelligenceEvent.deleteMany({});
  
  const stats = await liveIngestionService.pollAllProviders();
  console.log("Ingestion Stats:", stats);

  const count = await IntelligenceEvent.countDocuments();
  console.log(`Events in DB: ${count}`);

  if (count > 0 && stats.inserted === count) {
    console.log("[PASS] Ingestion inserted correct number of events.");
  } else {
    console.error("[FAIL] Ingestion mismatch.");
    process.exit(1);
  }
  process.exit(0);
}
run();
