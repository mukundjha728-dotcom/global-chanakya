import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { SystemConfig } from "../src/lib/models/SystemConfig";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

async function auditExternalBlockers() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected.\n");

  try {
    console.log("=== TAXONOMY DB AUDIT ===");
    // The models might be Country, Leader, Conflict. Let's try to query them dynamically if models exist,
    // or just check the collections.
    const collections = await mongoose.connection.db?.listCollections().toArray();
    const collectionNames = collections?.map(c => c.name) || [];

    for (const name of ['countries', 'leaders', 'conflicts']) {
      if (collectionNames.includes(name)) {
        const count = await mongoose.connection.db?.collection(name).countDocuments();
        console.log(`Collection '${name}': ${count} documents`);
      } else {
        console.log(`Collection '${name}' does not exist in DB.`);
      }
    }

    console.log("\n=== CRON EVIDENCE AUDIT ===");
    const recentEvents = await IntelligenceEvent.find().sort({ createdAt: -1 }).limit(5);
    console.log(`Found ${recentEvents.length} recent IntelligenceEvents.`);
    if (recentEvents.length > 0) {
      console.log(`Most recent event created at: ${recentEvents[0].createdAt}`);
    }
    
    // Check if there are any events created without user (i.e. by cron)
    // Actually we can just check if any event was created recently.
    
    // For Vercel, we can't easily check remote logs via mongoose. 
    // We will rely on DB timestamps.

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

auditExternalBlockers();
