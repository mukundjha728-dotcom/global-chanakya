import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnect from "../src/lib/mongoose";
import { Country } from "../src/lib/models/Country";
import { Leader } from "../src/lib/models/Leader";
import { Conflict } from "../src/lib/models/Conflict";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

async function main() {
  await dbConnect();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database not connected properly");
  }

  console.log("Running Phase 6.2 Forensic Audit...");

  const countryCount = await Country.countDocuments();
  const leaderCount = await Leader.countDocuments();
  const conflictCount = await Conflict.countDocuments();
  const eventCount = await IntelligenceEvent.countDocuments();

  const publishedEventCount = await IntelligenceEvent.countDocuments({ status: "published" });

  const eventsWithCountry = await IntelligenceEvent.countDocuments({ countries: { $exists: true, $not: { $size: 0 } } });
  const eventsWithLeader = await IntelligenceEvent.countDocuments({ leaders: { $exists: true, $not: { $size: 0 } } });
  const eventsWithConflict = await IntelligenceEvent.countDocuments({ conflicts: { $exists: true, $not: { $size: 0 } } });

  const unresolvedEvents = await IntelligenceEvent.countDocuments({
    $and: [
      { $or: [{ countries: { $exists: false } }, { countries: { $size: 0 } }] },
      { $or: [{ leaders: { $exists: false } }, { leaders: { $size: 0 } }] },
      { $or: [{ conflicts: { $exists: false } }, { conflicts: { $size: 0 } }] }
    ]
  });

  const duplicateCountries = await Country.aggregate([
    { $group: { _id: "$name", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  const duplicateLeaders = await Leader.aggregate([
    { $group: { _id: "$name", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  const duplicateConflicts = await Conflict.aggregate([
    { $group: { _id: "$name", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);

  // Enrichment status
  const enrichmentDistribution = await IntelligenceEvent.aggregate([
    { $group: { _id: "$enrichmentStatus", count: { $sum: 1 } } }
  ]);

  // Orphaned and Malformed references checking
  let orphanedCountryRefs = 0;
  let orphanedLeaderRefs = 0;
  let orphanedConflictRefs = 0;

  const validCountryIds = new Set((await Country.find({}, { _id: 1 }).lean()).map((c: any) => c._id.toString()));
  const validLeaderIds = new Set((await Leader.find({}, { _id: 1 }).lean()).map((l: any) => l._id.toString()));
  const validConflictIds = new Set((await Conflict.find({}, { _id: 1 }).lean()).map((c: any) => c._id.toString()));

  const allEvents = await IntelligenceEvent.find({}, { countries: 1, leaders: 1, conflicts: 1 }).lean();
  let malformedObjectIds = 0;

  for (const event of allEvents as any) {
    for (const c of event.countries || []) {
      if (!mongoose.Types.ObjectId.isValid(c)) {
        malformedObjectIds++;
      } else if (!validCountryIds.has(c.toString())) {
        orphanedCountryRefs++;
      }
    }
    for (const l of event.leaders || []) {
      if (!mongoose.Types.ObjectId.isValid(l)) {
        malformedObjectIds++;
      } else if (!validLeaderIds.has(l.toString())) {
        orphanedLeaderRefs++;
      }
    }
    for (const conf of event.conflicts || []) {
      if (!mongoose.Types.ObjectId.isValid(conf)) {
        malformedObjectIds++;
      } else if (!validConflictIds.has(conf.toString())) {
        orphanedConflictRefs++;
      }
    }
  }

  const report = `
# Phase 6.2 Forensic Audit Report

## 1. Database Counts
- Countries: ${countryCount}
- Leaders: ${leaderCount}
- Conflicts: ${conflictCount}
- IntelligenceEvents: ${eventCount}
- Published Events: ${publishedEventCount}

## 2. Event Taxonomy Mappings
- Events with Countries: ${eventsWithCountry}
- Events with Leaders: ${eventsWithLeader}
- Events with Conflicts: ${eventsWithConflict}
- Completely Unresolved Events: ${unresolvedEvents}

## 3. Data Integrity Issues
- Duplicate Countries: ${duplicateCountries.length}
- Duplicate Leaders: ${duplicateLeaders.length}
- Duplicate Conflicts: ${duplicateConflicts.length}
- Malformed ObjectIds: ${malformedObjectIds}
- Orphaned Country References: ${orphanedCountryRefs}
- Orphaned Leader References: ${orphanedLeaderRefs}
- Orphaned Conflict References: ${orphanedConflictRefs}

## 4. Enrichment Status Distribution
${enrichmentDistribution.map(d => `- ${d._id}: ${d.count}`).join("\n")}
  `;

  // Output to stdout and write to file
  console.log(report);
  const outPath = path.join(process.cwd(), "phase6_2_forensic_audit.md");
  fs.writeFileSync(outPath, report.trim());
  console.log("Report saved to", outPath);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
