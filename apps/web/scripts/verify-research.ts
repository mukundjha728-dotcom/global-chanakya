import { config } from "dotenv";
config({ path: ".env.local" });
import dbConnect from "../src/lib/mongoose";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

async function checkResearch() {
  await dbConnect();
  const events = await IntelligenceEvent.find({ status: "published" })
    .sort({ publishedAt: -1 })
    .limit(15)
    .lean();
  
  console.log(`Found ${events.length} recent intelligence events for research pipeline:`);
  events.forEach((ev, i) => {
    console.log(`[${i+1}] ${ev.title}`);
    console.log(`    Date: ${ev.publishedAt || ev.createdAt}`);
    console.log(`    Source: ${ev.sourceUrl}`);
  });
  process.exit(0);
}
checkResearch().catch(console.error);
