import { liveIngestionService } from "../src/lib/intelligence/live/ingestion.service";
import dbConnect from "../src/lib/mongoose";

async function main() {
  await dbConnect();
  
  console.log("Testing ingestion directly...");
  const stats = await liveIngestionService.pollAllProviders({ maxDurationMs: 8000, maxCandidates: 2 });
  
  console.log("Result Stats:", stats);
  process.exit(0);
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
