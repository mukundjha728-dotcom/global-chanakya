import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnect from "../src/lib/mongoose";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

async function main() {
  await dbConnect();
  
  const count = await IntelligenceEvent.countDocuments({
    status: "published",
    enrichmentStatus: { $ne: "COMPLETED" }
  });
  
  console.log(`FAILED + published = ${count}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
