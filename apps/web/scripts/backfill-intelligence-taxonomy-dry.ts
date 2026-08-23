import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnect from "../src/lib/mongoose";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";
import { Country } from "../src/lib/models/Country";
import { Leader } from "../src/lib/models/Leader";
import { Conflict } from "../src/lib/models/Conflict";
import { matchEntity } from "../src/lib/intelligence/live/entityResolver";

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
  let wouldUpdate = 0;
  let resolvedCountries = 0;
  let resolvedLeaders = 0;
  let resolvedConflicts = 0;
  let ambiguous = 0;
  let unresolved = 0;

  console.log("Running Phase 6.2 Entity Resolution Backfill DRY RUN...");

  for (const event of events as any) {
    const fullText = `${event.title} ${event.summary} ${event.content}`.toLowerCase();
    
    const matchedCountries = matchEntity(fullText, dict.countries);
    const matchedLeaders = matchEntity(fullText, dict.leaders);
    const matchedConflicts = matchEntity(fullText, dict.conflicts, true);

    const countryIds = matchedCountries.map((r: any) => r.entityId);
    const leaderIds = matchedLeaders.map((r: any) => r.entityId);
    const conflictIds = matchedConflicts.map((r: any) => r.entityId);

    const hasNew = (countryIds.length > 0 && countryIds.length !== (event.countries?.length || 0)) ||
                   (leaderIds.length > 0 && leaderIds.length !== (event.leaders?.length || 0)) ||
                   (conflictIds.length > 0 && conflictIds.length !== (event.conflicts?.length || 0));

    if (hasNew) {
      wouldUpdate++;
      resolvedCountries += countryIds.length;
      resolvedLeaders += leaderIds.length;
      resolvedConflicts += conflictIds.length;
    }

    if (countryIds.length === 0 && leaderIds.length === 0 && conflictIds.length === 0) {
      unresolved++;
    }
  }

  console.log("\n--- DRY RUN RESULTS ---");
  console.log(`Scanned: ${events.length}`);
  console.log(`Would Update: ${wouldUpdate}`);
  console.log(`Countries resolved: ${resolvedCountries}`);
  console.log(`Leaders resolved: ${resolvedLeaders}`);
  console.log(`Conflicts resolved: ${resolvedConflicts}`);
  console.log(`Ambiguous (skipped): ${ambiguous}`);
  console.log(`Unresolved events: ${unresolved}`);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
