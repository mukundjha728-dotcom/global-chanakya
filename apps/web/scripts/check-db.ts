import { config } from "dotenv";
config({ path: ".env.local" });
import dbConnect from "../src/lib/mongoose";
import { BlogPublishingRun } from "../src/lib/models/BlogPublishingRun";

async function checkDb() {
  await dbConnect();
  const runs = await BlogPublishingRun.find().sort({ createdAt: -1 }).limit(5);
  for (const r of runs) {
    console.log(`Run ${r.runId} status: ${r.status}`);
    for (const c of r.categoryResults) {
      console.log(` - Category ${c.category}: ${c.status}, hasResearchData: ${!!c.researchData}`);
    }
  }
  process.exit(0);
}
checkDb();
