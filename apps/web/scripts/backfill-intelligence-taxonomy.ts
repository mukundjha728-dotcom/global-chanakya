import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnect from "../src/lib/mongoose";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";
import { Country } from "../src/lib/models/Country";
import { Leader } from "../src/lib/models/Leader";
import { Conflict } from "../src/lib/models/Conflict";
import { matchEntity } from "../src/lib/intelligence/live/entityResolver";
import mongoose from "mongoose";

async function main() {
  await dbConnect();
  
  const [countries, leaders, conflicts] = await Promise.all([
    Country.find({ status: { $ne: "inactive" } }).select("_id name aliases").lean(),
    Leader.find({ status: { $ne: "inactive" } }).select("_id name aliases").lean(),
    Conflict.find({ status: { $ne: "inactive" } }).select("_id name aliases").lean()
  ]);

  const dict = {
    countries: countries.map((c: any) => ({ ...c, id: c._id })),
    leaders: leaders.map((l: any) => ({ ...l, id: l._id })),
    conflicts: conflicts.map((c: any) => ({ ...c, id: c._id }))
  };

  const events = await IntelligenceEvent.find({}).lean();
  let updatedCount = 0;

  console.log("Running Phase 6.2 Entity Resolution Backfill...");

  for (const event of events as any) {
    const fullText = `${event.title} ${event.summary} ${event.content}`.toLowerCase();
    
    const matchedCountries = matchEntity(fullText, dict.countries);
    const matchedLeaders = matchEntity(fullText, dict.leaders);
    const matchedConflicts = matchEntity(fullText, dict.conflicts, true);

    const countryIds = Array.from(new Set(matchedCountries.map((r: any) => r.entityId)));
    const leaderIds = Array.from(new Set(matchedLeaders.map((r: any) => r.entityId)));
    const conflictIds = Array.from(new Set(matchedConflicts.map((r: any) => r.entityId)));

    // Ensure idempotency: only update if changes exist.
    const currC = (event.countries || []).map((id: any) => id.toString());
    const currL = (event.leaders || []).map((id: any) => id.toString());
    const currConf = (event.conflicts || []).map((id: any) => id.toString());
    
    if (countryIds.sort().join(",") !== currC.sort().join(",") ||
        leaderIds.sort().join(",") !== currL.sort().join(",") ||
        conflictIds.sort().join(",") !== currConf.sort().join(",")) {
        
        await IntelligenceEvent.findByIdAndUpdate(event._id, {
          countries: countryIds.map(id => new mongoose.Types.ObjectId(id)),
          leaders: leaderIds.map(id => new mongoose.Types.ObjectId(id)),
          conflicts: conflictIds.map(id => new mongoose.Types.ObjectId(id)),
        });
        updatedCount++;
    }
  }

  console.log("\n--- BACKFILL RESULTS ---");
  console.log(`Scanned: ${events.length}`);
  console.log(`Updated: ${updatedCount}`);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
