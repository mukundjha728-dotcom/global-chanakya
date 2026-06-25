import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../../.env.local") });

import { Conflict } from "../src/lib/models/Conflict";
import { Region } from "../src/lib/models/Region";
import { Timeline } from "../src/lib/models/Timeline";

// Static Data
import { CONFLICTS_DATA, TIMELINE_EVENTS } from "../src/constants/conflicts";
import { REGIONS_DATA } from "../src/constants/regions";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    // Seed Conflicts
    console.log("Seeding Conflicts...");
    for (const data of CONFLICTS_DATA) {
      await Conflict.findOneAndUpdate(
        { slug: data.slug },
        {
          title: data.title,
          slug: data.slug,
          conflictState: data.threatLevel === "High Risk" ? "Escalating" : data.threatLevel === "Critical" ? "Active" : data.threatLevel === "Stable" ? "Ceasefire" : "Active",
          status: "published",
          startDate: new Date(),
          regions: [data.region],
          overview: data.summary,
          strategicTags: [data.category],
          source: "seeded",
          isSystemGenerated: true,
          publishAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${CONFLICTS_DATA.length} Conflicts`);

    // Seed Regions
    console.log("Seeding Regions...");
    for (const data of REGIONS_DATA) {
      await Region.findOneAndUpdate(
        { slug: data.slug },
        {
          title: data.title,
          slug: data.slug,
          theatre: data.theatre,
          strategicWeight: data.strategicWeight,
          status: "published",
          summary: data.summary,
          category: data.category,
          keyPlayers: data.keyPlayers,
          image: data.image,
          trend: data.trend,
          source: "seeded",
          isSystemGenerated: true,
          publishAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${REGIONS_DATA.length} Regions`);

    // Seed Timeline
    console.log("Seeding Timeline Events...");
    // Just seed them as general events for now, since we don't have entityId mapping easily available
    for (const data of TIMELINE_EVENTS) {
      // Find a dummy entityId, or just omit if not strictly required, but entityId is required in Timeline Schema.
      // We'll pick the first conflict
      const firstConflict = await Conflict.findOne();
      if (firstConflict) {
        await Timeline.findOneAndUpdate(
          { title: data.type, description: data.description },
          {
            title: data.type,
            description: data.description,
            eventDate: new Date(),
            entityType: "conflict",
            entityId: firstConflict._id,
            severity: data.severity,
            status: "published",
            source: "seeded",
            isSystemGenerated: true,
            publishAt: new Date(),
          },
          { upsert: true, new: true }
        );
      }
    }
    console.log(`Seeded ${TIMELINE_EVENTS.length} Timeline Events`);

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
