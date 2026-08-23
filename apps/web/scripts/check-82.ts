import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import dbConnect from "../src/lib/mongoose";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

async function main() {
  await dbConnect();
  
  const pendingCount = await IntelligenceEvent.countDocuments({ status: "published", enrichmentStatus: "PENDING" });
  const failedCount = await IntelligenceEvent.countDocuments({ status: "published", enrichmentStatus: "FAILED" });
  
  console.log(`PENDING + published = ${pendingCount}`);
  console.log(`FAILED + published = ${failedCount}`);
  
  // Let's just fix them directly, if they are PENDING they should be DRAFT too.
  if (pendingCount > 0) {
    const res = await IntelligenceEvent.updateMany(
      { status: "published", enrichmentStatus: { $ne: "COMPLETED" } },
      { $set: { status: "draft" } }
    );
    console.log(`Updated ${res.modifiedCount} documents to draft`);
  }
  process.exit(0);
}
main();
