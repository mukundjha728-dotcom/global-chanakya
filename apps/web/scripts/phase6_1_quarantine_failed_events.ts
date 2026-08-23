import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnect from "../src/lib/mongoose";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

async function main() {
  await dbConnect();

  console.log("==================================================");
  console.log("PHASE 6.1: QUARANTINE FAILED EVENTS");
  console.log("==================================================");

  const beforeFailedPublished = await IntelligenceEvent.countDocuments({
    enrichmentStatus: "FAILED",
    status: "published"
  });

  console.log(`FAILED + published before quarantine: ${beforeFailedPublished}`);

  // Perform the update
  const updateResult = await IntelligenceEvent.updateMany(
    { enrichmentStatus: "FAILED", status: "published" },
    { $set: { status: "draft" } }
  );

  console.log(`Moved to draft: ${updateResult.modifiedCount}`);

  const afterFailedDraft = await IntelligenceEvent.countDocuments({
    enrichmentStatus: "FAILED",
    status: "draft"
  });

  console.log(`FAILED + draft after quarantine: ${afterFailedDraft}`);

  const remainingFailedPublished = await IntelligenceEvent.countDocuments({
    enrichmentStatus: "FAILED",
    status: "published"
  });

  console.log(`Remaining FAILED + published: ${remainingFailedPublished}`);

  console.log("\nDone.");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
