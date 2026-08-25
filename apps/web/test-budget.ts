import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import dbConnect from "./src/lib/mongoose";
import { liveIngestionService } from "./src/lib/intelligence/live/ingestion.service";

async function run() {
  await dbConnect();
  console.log("DB Connected.");
  
  const start = Date.now();
  console.log("Starting bounded run (7s budget)...");
  
  const stats = await liveIngestionService.pollAllProviders({
    maxDurationMs: 7000,
    maxCandidates: 2
  });
  
  const end = Date.now();
  
  console.log("\n=== RUN COMPLETED ===");
  console.log(`Duration: ${end - start}ms`);
  console.log("Stats:", stats);
  process.exit(0);
}

run();
