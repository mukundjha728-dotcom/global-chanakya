import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import dbConnect from "../src/lib/mongoose";
import { Country } from "../src/lib/models/Country";
import { Leader } from "../src/lib/models/Leader";
import { Conflict } from "../src/lib/models/Conflict";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";
import { redisCache } from "../src/lib/cache/redis.cache";
import mongoose from "mongoose";

async function main() {
  await dbConnect();
  
  console.log("=== 2. DATABASE SNAPSHOT ===");
  
  const getStats = (items: any[]) => {
    return {
      total: items.length,
      active: items.filter(i => i.status !== "inactive").length,
      inactive: items.filter(i => i.status === "inactive").length,
    };
  };

  const countries = await Country.find({}).lean();
  const leaders = await Leader.find({}).lean();
  const conflicts = await Conflict.find({}).lean();

  console.log("Countries:", getStats(countries));
  console.log("Leaders:", getStats(leaders));
  console.log("Conflicts:", getStats(conflicts));

  const events = await IntelligenceEvent.find({}).lean();
  const validCountryIds = new Set(countries.map(c => c._id.toString()));
  const validLeaderIds = new Set(leaders.map(l => l._id.toString()));
  const validConflictIds = new Set(conflicts.map(c => c._id.toString()));

  const evStats = {
    total: events.length,
    published: 0, draft: 0, archived: 0, error: 0,
    failedEnrichment: 0, completedEnrichment: 0, pendingEnrichment: 0,
    withCountries: 0, withLeaders: 0, withConflicts: 0,
    unresolved: 0, invalidObjectIds: 0,
    duplicateHashes: 0, duplicateSlugs: 0,
    malformedEmbeddings: 0, wrongDimensions: 0,
    orphanedReferences: 0
  };

  const eventHashes = new Set();
  const eventSlugs = new Set();

  for (const ev of events) {
    if (ev.status === "published") evStats.published++;
    else if (ev.status === "draft") evStats.draft++;
    else if (ev.status === "archived") evStats.archived++;
    else if (ev.status === "error") evStats.error++;

    if (ev.enrichmentStatus === "FAILED") evStats.failedEnrichment++;
    else if (ev.enrichmentStatus === "COMPLETED") evStats.completedEnrichment++;
    else if (ev.enrichmentStatus === "PENDING") evStats.pendingEnrichment++;

    const cCount = (ev.countries || []).length;
    const lCount = (ev.leaders || []).length;
    const confCount = (ev.conflicts || []).length;

    if (cCount > 0) evStats.withCountries++;
    if (lCount > 0) evStats.withLeaders++;
    if (confCount > 0) evStats.withConflicts++;

    if (cCount === 0 && lCount === 0 && confCount === 0) evStats.unresolved++;

    for (const cid of (ev.countries || [])) if (!validCountryIds.has(cid.toString())) { evStats.invalidObjectIds++; evStats.orphanedReferences++; }
    for (const lid of (ev.leaders || [])) if (!validLeaderIds.has(lid.toString())) { evStats.invalidObjectIds++; evStats.orphanedReferences++; }
    for (const cid of (ev.conflicts || [])) if (!validConflictIds.has(cid.toString())) { evStats.invalidObjectIds++; evStats.orphanedReferences++; }

    if (ev.contentHash) {
      if (eventHashes.has(ev.contentHash)) evStats.duplicateHashes++;
      eventHashes.add(ev.contentHash);
    }
    if (ev.slug) {
      if (eventSlugs.has(ev.slug)) evStats.duplicateSlugs++;
      eventSlugs.add(ev.slug);
    }

    if (ev.embedding) {
      if (!Array.isArray(ev.embedding)) evStats.malformedEmbeddings++;
      else if (ev.embedding.length !== 384) evStats.wrongDimensions++;
    }
  }

  console.log("IntelligenceEvents:", evStats);

  console.log("\n=== 4. CRON / REDIS TELEMETRY ===");
  try {
    const stats = await redisCache.get("live_ingestion_stats");
    console.log("Telemetry from Redis:", stats);
  } catch (e) {
    console.log("Redis telemetry error:", e);
  }
  
  console.log("\n=== 12. ATLAS SEARCH INDEX ===");
  try {
    // Only fetch Atlas search index stats if available. Mongoose driver may not support it directly, 
    // but let's try a direct aggregation.
    const collection = mongoose.connection.db.collection('intelligenceevents');
    const indexes = await collection.aggregate([{ $listSearchIndexes: {} }]).toArray();
    console.log("Search Indexes:");
    indexes.forEach(idx => {
       console.log(`- Name: ${idx.name}, Status: ${idx.status}`);
    });
  } catch(e) {
    console.log("Atlas Index Check Error:", e.message);
  }

  process.exit(0);
}

main().catch(console.error);
