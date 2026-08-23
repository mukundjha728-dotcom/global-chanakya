

import dbConnect from "../src/lib/mongoose";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";
import { Blog } from "../src/lib/models/Blog"; // for checking RAG version if necessary, though it's usually system level

async function run() {
  await dbConnect();
  console.log("=== FINAL REALITY AUDIT: DATABASE METRICS ===\n");

  // 1. Publication Guard Check
  const publishedButNotEnriched = await IntelligenceEvent.countDocuments({
    status: "published",
    enrichmentStatus: { $ne: "COMPLETED" }
  });

  console.log("--- 1. PUBLICATION GUARD ---");
  console.log(`Published events without COMPLETED enrichment: ${publishedButNotEnriched}`);
  if (publishedButNotEnriched > 0) {
    console.error("❌ PUBLICATION GUARD FAILED. Live feed is exposed.");
  } else {
    console.log("✅ Publication guard is completely secure.");
  }

  // 2. State metrics
  const total = await IntelligenceEvent.countDocuments();
  const published = await IntelligenceEvent.countDocuments({ status: "published" });
  const draft = await IntelligenceEvent.countDocuments({ status: "draft" });
  const archived = await IntelligenceEvent.countDocuments({ status: "archived" });
  const failed = await IntelligenceEvent.countDocuments({ enrichmentStatus: "FAILED" });
  
  console.log("\n--- 2. INTELLIGENCE EVENT METRICS ---");
  console.log(`Total: ${total}`);
  console.log(`Published: ${published}`);
  console.log(`Draft: ${draft}`);
  console.log(`Archived: ${archived}`);
  console.log(`Enrichment FAILED: ${failed}`);

  // 3. Duplicate checks
  const hashAgg = await IntelligenceEvent.aggregate([
    { $group: { _id: "$contentHash", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 }, _id: { $ne: null } } }
  ]);
  console.log(`\nDuplicate content hashes: ${hashAgg.length}`);
  
  const slugAgg = await IntelligenceEvent.aggregate([
    { $group: { _id: "$slug", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 }, _id: { $ne: null } } }
  ]);
  console.log(`Duplicate slugs: ${slugAgg.length}`);

  if (hashAgg.length === 0 && slugAgg.length === 0) {
    console.log("✅ Duplicate prevention verified.");
  }

  console.log("\n=== DB AUDIT COMPLETE ===");
  process.exit(0);
}

run().catch(console.error);
