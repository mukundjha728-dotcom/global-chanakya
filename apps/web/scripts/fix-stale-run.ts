import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import dbConnect from "../src/lib/mongoose";
import { BlogPublishingRun } from "../src/lib/models/BlogPublishingRun";
import mongoose from "mongoose";

async function fix() {
  await dbConnect();

  // Find all QUEUED or RUNNING runs
  const staleRuns = await BlogPublishingRun.find({
    status: { $in: ["QUEUED", "RUNNING"] }
  }).lean() as any[];

  if (staleRuns.length === 0) {
    console.log("No stale runs found. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  for (const run of staleRuns) {
    console.log(`Found stale run: ${run.runId} | status: ${run.status} | isDryRun: ${run.isDryRun}`);
    for (const r of run.categoryResults || []) {
      console.log(`  [${r.status}] ${r.category}`);
    }

    // Mark it COMPLETED so the engine can create a fresh run
    await BlogPublishingRun.updateOne(
      { runId: run.runId },
      { $set: { status: "COMPLETED", completedAt: new Date() } }
    );
    console.log(`  → Marked as COMPLETED`);
  }

  console.log("\nStale runs cleared. Engine will create a fresh run on next trigger click.");
  await mongoose.disconnect();
  process.exit(0);
}

fix().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
