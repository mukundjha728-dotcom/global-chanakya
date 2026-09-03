import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as cheerio from "cheerio";
import crypto from "crypto";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const ARTIFACT_DIR = "C:\\Users\\mukun\\.gemini\\antigravity-ide\\brain\\76d58757-7674-4135-8447-6d89f0a69a1a";

function getChecksum(data: any) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

const targetCandidates = [
    "china-taiwan-invasion-timeline-2026",
    "united-states-indo-pacific-command-strategy-2026",
    "xi-jinping-final-term-endgame-strategy-2026",
    "nato-future-unstable-europe-2026",
    "russia-ukraine-war-timeline-strategic-analysis-2026"
];

async function run() {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB.");

    const Blog = mongoose.connection.db!.collection("blogs");
    const allPublished = await Blog.find({ status: "published" }).toArray();
    
    const resolved = [];
    
    for (const target of targetCandidates) {
        let match = allPublished.find(b => b.slug === target);
        let method = "exact slug match";
        
        if (!match) {
            match = allPublished.find(b => b.slug.includes(target) || target.includes(b.slug));
            method = "normalized slug match";
        }
        
        if (!match) {
            // Try title match logic - rudimentary keywords
            const keywords = target.replace(/-/g, " ").toLowerCase().split(" ");
            match = allPublished.find(b => {
                const titleStr = b.title.toLowerCase();
                // Find if title contains most keywords
                const matchedWords = keywords.filter(k => titleStr.includes(k) && k.length > 3);
                return matchedWords.length >= 3;
            });
            method = "title/semantic fallback";
        }
        
        if (match) {
            resolved.push({
                requested: target,
                actual: match.slug,
                _id: match._id,
                title: match.title,
                method,
                doc: match
            });
        } else {
            console.warn(`UNRESOLVED: ${target}`);
        }
    }
    
    console.log("\nResolution Report:");
    for (const r of resolved) {
        console.log(`- Requested: ${r.requested}\n  Actual: ${r.actual}\n  Method: ${r.method}\n`);
    }
    
    process.exit(0);
}

run().catch(console.error);
