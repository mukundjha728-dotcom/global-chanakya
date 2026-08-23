import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongoose';
import { IntelligenceEvent } from '../src/lib/models/IntelligenceEvent';
import { Country } from '../src/lib/models/Country';
import { Leader } from '../src/lib/models/Leader';
import { Conflict } from '../src/lib/models/Conflict';
import { EventNormalizer, EntityDictionary } from '../src/lib/intelligence/live/eventNormalizer';

async function backfillEntities() {
  console.log("Connecting to database...");
  await dbConnect();
  
  console.log("Loading entity dictionary...");
  const dict: EntityDictionary = { countries: [], leaders: [], conflicts: [] };
  const [countries, leaders, conflicts] = await Promise.all([
    Country.find({ status: "active" }).select("_id name").lean(),
    Leader.find({ status: "active" }).select("_id name").lean(),
    Conflict.find({ status: "active" }).select("_id name").lean()
  ]);
  
  dict.countries = countries.map(c => ({ id: (c as any)._id, name: (c as any).name }));
  dict.leaders = leaders.map(l => ({ id: (l as any)._id, name: (l as any).name }));
  dict.conflicts = conflicts.map(c => ({ id: (c as any)._id, name: (c as any).name }));
  
  console.log(`Loaded ${dict.countries.length} countries, ${dict.leaders.length} leaders, ${dict.conflicts.length} conflicts.`);
  
  const events = await IntelligenceEvent.find({
    $and: [
      { $or: [{ countries: { $exists: false } }, { countries: { $size: 0 } }] },
      { $or: [{ leaders: { $exists: false } }, { leaders: { $size: 0 } }] },
      { $or: [{ conflicts: { $exists: false } }, { conflicts: { $size: 0 } }] }
    ]
  });

  console.log(`Found ${events.length} unresolved events.`);

  let stats = {
    scanned: events.length,
    countriesAdded: 0,
    leadersAdded: 0,
    conflictsAdded: 0,
    stillUnresolved: 0,
    unchanged: 0
  };

  for (const ev of events) {
    const fakeItem = {
      title: ev.title,
      description: ev.summary,
      content: ev.content,
      url: ev.sourceUrls[0] || "",
      source: ev.sourceNames[0] || "",
      publishedAt: ev.publishedAt
    };
    
    // We only use normalizer to extract the entities based on full text
    const normalized = EventNormalizer.normalize(fakeItem, dict);
    
    let changed = false;
    if (normalized.countries.length > 0) {
      ev.countries = normalized.countries;
      stats.countriesAdded += normalized.countries.length;
      changed = true;
    }
    if (normalized.leaders.length > 0) {
      ev.leaders = normalized.leaders;
      stats.leadersAdded += normalized.leaders.length;
      changed = true;
    }
    if (normalized.conflicts.length > 0) {
      ev.conflicts = normalized.conflicts;
      stats.conflictsAdded += normalized.conflicts.length;
      changed = true;
    }
    
    if (changed) {
      await ev.save();
    } else {
      stats.stillUnresolved++;
      stats.unchanged++;
    }
  }

  console.log("\n=== BACKFILL COMPLETE ===");
  console.log(`Scanned: ${stats.scanned}`);
  console.log(`Countries Added: ${stats.countriesAdded}`);
  console.log(`Leaders Added: ${stats.leadersAdded}`);
  console.log(`Conflicts Added: ${stats.conflictsAdded}`);
  console.log(`Still Unresolved: ${stats.stillUnresolved}`);
  console.log(`Unchanged: ${stats.unchanged}`);
  
  process.exit(0);
}

backfillEntities().catch(console.error);
