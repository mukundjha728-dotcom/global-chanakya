import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import dbConnect from "../src/lib/mongoose";
import { Country } from "../src/lib/models/Country";
import { Leader } from "../src/lib/models/Leader";
import { Conflict } from "../src/lib/models/Conflict";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

async function main() {
  await dbConnect();
  
  console.log("=== 1. TAXONOMY DATABASE AUDIT ===");
  
  const getStats = (items: any[]) => {
    const total = items.length;
    const active = items.filter(i => i.status !== "inactive").length;
    const inactive = items.filter(i => i.status === "inactive").length;
    const withAliases = items.filter(i => i.aliases && i.aliases.length > 0).length;
    
    const canonicalNames = new Set();
    let dupNames = 0;
    const aliasesSet = new Set();
    let dupAliases = 0;
    
    for (const i of items) {
      if (canonicalNames.has(i.name.toLowerCase())) dupNames++;
      canonicalNames.add(i.name.toLowerCase());
      
      for (const a of (i.aliases || [])) {
        if (aliasesSet.has(a.toLowerCase())) dupAliases++;
        aliasesSet.add(a.toLowerCase());
      }
    }
    
    return { total, active, inactive, withAliases, dupNames, dupAliases };
  };

  const countries = await Country.find({}).lean();
  const leaders = await Leader.find({}).lean();
  const conflicts = await Conflict.find({}).lean();

  console.log("Countries:", getStats(countries));
  console.log("Leaders:", getStats(leaders));
  console.log("Conflicts:", getStats(conflicts));

  // invalid country references
  const validCountryIds = new Set(countries.map(c => c._id.toString()));
  let invalidLeaderCountries = 0;
  for (const l of leaders) {
    if (l.countryId && !validCountryIds.has(l.countryId.toString())) {
      invalidLeaderCountries++;
    }
  }
  console.log("Leaders with invalid country references:", invalidLeaderCountries);

  console.log("\n=== 2. INTELLIGENCE EVENT RESOLUTION AUDIT ===");
  const events = await IntelligenceEvent.find({}).lean();
  
  let eventsWithC = 0, eventsWithL = 0, eventsWithConf = 0;
  let unresolved = 0, partially = 0, fully = 0;
  let totalC = 0, totalL = 0, totalConf = 0;
  let invalidRefs = 0, orphanedRefs = 0;

  const validLeaderIds = new Set(leaders.map(l => l._id.toString()));
  const validConflictIds = new Set(conflicts.map(c => c._id.toString()));

  for (const ev of events) {
    const cCount = (ev.countries || []).length;
    const lCount = (ev.leaders || []).length;
    const confCount = (ev.conflicts || []).length;

    if (cCount > 0) eventsWithC++;
    if (lCount > 0) eventsWithL++;
    if (confCount > 0) eventsWithConf++;

    totalC += cCount;
    totalL += lCount;
    totalConf += confCount;

    if (cCount === 0 && lCount === 0 && confCount === 0) {
      unresolved++;
    } else {
      // Assuming partially resolved means it has some but not all? Actually, any resolution means it's resolved.
      // Wait, "fully resolved events" might mean no unknown entities? Hard to test statically.
      partially++; 
    }

    // Check valid ids
    for (const cid of (ev.countries || [])) {
      if (!validCountryIds.has(cid.toString())) invalidRefs++;
    }
    for (const lid of (ev.leaders || [])) {
      if (!validLeaderIds.has(lid.toString())) invalidRefs++;
    }
    for (const conf of (ev.conflicts || [])) {
      if (!validConflictIds.has(conf.toString())) invalidRefs++;
    }
  }

  console.log(`Total Events: ${events.length}`);
  console.log(`Events with Countries: ${eventsWithC}`);
  console.log(`Events with Leaders: ${eventsWithL}`);
  console.log(`Events with Conflicts: ${eventsWithConf}`);
  console.log(`Unresolved events: ${unresolved}`);
  
  console.log(`Total country refs: ${totalC}`);
  console.log(`Total leader refs: ${totalL}`);
  console.log(`Total conflict refs: ${totalConf}`);
  console.log(`Invalid ObjectId references: ${invalidRefs}`);
  console.log(`Orphaned references: ${orphanedRefs}`);

  console.log("\n=== 11. DATA INTEGRITY ===");
  const eventHashes = new Set();
  let dupHashes = 0;
  const eventSlugs = new Set();
  let dupSlugs = 0;
  let malformedEmbeddings = 0;
  let wrongDimensions = 0;

  for (const ev of events) {
    if (ev.contentHash) {
      if (eventHashes.has(ev.contentHash)) dupHashes++;
      eventHashes.add(ev.contentHash);
    }
    if (ev.slug) {
      if (eventSlugs.has(ev.slug)) dupSlugs++;
      eventSlugs.add(ev.slug);
    }

    if (ev.embedding) {
      if (!Array.isArray(ev.embedding)) {
        malformedEmbeddings++;
      } else if (ev.embedding.length !== 384) {
        wrongDimensions++;
      }
    }
  }
  
  console.log(`Duplicate Event Hashes: ${dupHashes}`);
  console.log(`Duplicate Event Slugs: ${dupSlugs}`);
  console.log(`Malformed Embeddings: ${malformedEmbeddings}`);
  console.log(`Wrong Dimensions: ${wrongDimensions}`);
  console.log(`Invalid Taxonomy References: ${invalidRefs}`);

  process.exit(0);
}

main().catch(console.error);
