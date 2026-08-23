import dbConnect from "../src/lib/mongoose";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

async function run() {
  await dbConnect();
  const res = await IntelligenceEvent.updateMany(
    { status: "published", enrichmentStatus: { $ne: "COMPLETED" } },
    { $set: { status: "draft" } }
  );
  console.log(`Fixed ${res.modifiedCount} legacy dirty events.`);
  process.exit(0);
}
run().catch(console.error);
