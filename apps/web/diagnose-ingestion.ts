import "dotenv/config";
import dbConnect from "./src/lib/mongoose";
import { liveIngestionService } from "./src/lib/intelligence/live/ingestion.service";
import { IntelligenceEvent } from "./src/lib/models/IntelligenceEvent";

async function diagnose() {
  await dbConnect();
  console.log("Connected to DB.");

  const stats = await liveIngestionService.pollAllProviders();
  console.log("\n\n--- INGESTION STATS ---");
  console.log(stats);

  const newDocs = await IntelligenceEvent.find({}).sort({ createdAt: -1 }).limit(10).lean();
  console.log("\n\n--- LATEST DOCS ---");
  for (const doc of newDocs) {
    console.log(`- ${doc.title} | Status: ${doc.status} | Enrichment: ${doc.enrichmentStatus}`);
  }
  process.exit(0);
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
