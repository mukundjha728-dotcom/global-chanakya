import { config } from "dotenv";
config({ path: ".env.local", override: true });
import dbConnect from "../src/lib/mongoose";
import { SystemConfig } from "../src/lib/models/SystemConfig";

async function run() {
  await dbConnect();
  console.log("=== Migrating SystemConfig for Live Intelligence ===");
  
  const activeConfig = await SystemConfig.findOne({ isActive: true });
  if (!activeConfig) {
    console.error("No active SystemConfig found. Creating one.");
    const newConfig = new SystemConfig({
      isActive: true,
      ragCorpusVersion: 1,
      liveCorpusVersion: 1
    });
    await newConfig.save();
    console.log("Created initial SystemConfig.");
    process.exit(0);
  }

  if (activeConfig.liveCorpusVersion === undefined) {
    activeConfig.liveCorpusVersion = 1;
    await activeConfig.save();
    console.log("Added liveCorpusVersion to existing SystemConfig.");
  } else {
    console.log(`liveCorpusVersion already exists: ${activeConfig.liveCorpusVersion}`);
  }

  console.log("Migration complete.");
  process.exit(0);
}

run();
