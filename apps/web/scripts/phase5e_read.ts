import mongoose from "mongoose";
import * as dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const ARTIFACT_DIR = "C:\\Users\\mukun\\.gemini\\antigravity-ide\\brain\\76d58757-7674-4135-8447-6d89f0a69a1a";

const targetSlugs = [
    "china-taiwan-invasion-timeline-2026",
    "united-states-indo-pacific-command-strategy-2026",
    "xi-jinping-final-term-endgame-strategy-2026",
    "nato-future-unstable-europe-2026",
    "russia-ukraine-war-timeline-strategic-analysis-2026"
];

async function run() {
    await mongoose.connect(MONGODB_URI as string);
    const Blog = mongoose.connection.db!.collection("blogs");
    
    const articles = await Blog.find({ slug: { $in: targetSlugs } }).toArray();
    fs.writeFileSync(`${ARTIFACT_DIR}\\phase5e_pilot_articles.json`, JSON.stringify(articles, null, 2));
    
    console.log(`Saved ${articles.length} articles.`);
    process.exit(0);
}

run().catch(console.error);
