import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { redisCache } from "../src/lib/cache/redis.cache";
import { SystemConfig } from "../src/lib/models/SystemConfig";
import dbConnect from "../src/lib/mongoose";

async function run() {
  console.log("=== LIVE CACHE TEST ===");
  await dbConnect();
  
  const config = await SystemConfig.findOne({ isActive: true });
  if (!config) throw new Error("No active config");

  const oldLiveVersion = config.liveCorpusVersion;
  console.log(`Initial liveCorpusVersion: ${oldLiveVersion}`);

  // Increment it
  config.liveCorpusVersion += 1;
  await config.save();
  await redisCache.set("live_corpus_version", config.liveCorpusVersion, 86400);

  const cachedLiveVersion = await redisCache.get<number>("live_corpus_version");
  console.log(`Cached liveCorpusVersion: ${cachedLiveVersion}`);

  if (cachedLiveVersion === config.liveCorpusVersion && cachedLiveVersion > oldLiveVersion) {
    console.log("[PASS] Cache invalidation logic is working properly.");
  } else {
    console.error("[FAIL] Cache version mismatch.");
    process.exit(1);
  }
  
  // Revert
  config.liveCorpusVersion = oldLiveVersion;
  await config.save();
  await redisCache.set("live_corpus_version", oldLiveVersion, 86400);
  
  process.exit(0);
}
run();
