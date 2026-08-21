import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

function generateChecksum(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data || "")).digest("hex");
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  
  const blogs = await mongoose.connection.db.collection('blogs').find({status: 'published'}).toArray();
  
  const baseline = [];
  const candidatesRaw = [];
  
  for (const blog of blogs) {
    const title = blog.title || "";
    const metaTitle = blog.seo?.title || "";
    const metaDesc = blog.seo?.description || "";
    
    baseline.push({
      _id: blog._id.toString(),
      slug: blog.slug,
      currentTitle: title,
      currentMetaTitle: metaTitle,
      currentMetaDescription: metaDesc,
      titleCharacterCount: (metaTitle || title).length,
      descriptionCharacterCount: metaDesc.length,
      primaryEntities: {
        category: blog.category,
        topics: blog.topics,
        countries: blog.countries,
        leaders: blog.leaders,
        conflicts: blog.conflicts,
        organizations: blog.organizations
      },
      checksums: {
        slug: generateChecksum(blog.slug),
        title: generateChecksum(blog.title),
        content: generateChecksum(blog.content),
        tags: generateChecksum(blog.tags),
        category: generateChecksum(blog.category)
      }
    });

    // Heuristics for candidates
    let score = 0;
    const len = (metaTitle || title).length;
    if (len > 60) score += (len - 60); // Penalty for being too long
    if (len > 100) score += 50; // Severe penalty
    if (!metaDesc) score += 100;
    else if (metaDesc.length < 50) score += 50;
    else if (metaDesc.length > 160) score += (metaDesc.length - 160);
    
    // Check specific examples user gave
    if (title.includes("India's Strategic Awakening") || 
        title.includes("Trump's Triple Diplomatic Gambit") || 
        title.includes("Multipolar World Order in 2026") || 
        title.includes("Indo-Pacific: The New Global Battleground")) {
        score += 200; // Prioritize explicitly mentioned ones
    }

    if (score > 10) {
      candidatesRaw.push({
        _id: blog._id.toString(),
        slug: blog.slug,
        oldTitle: metaTitle || title,
        oldDescription: metaDesc,
        titleLengthBefore: len,
        descriptionLengthBefore: metaDesc.length,
        score,
        // Excerpt for the LLM to understand content (strip html)
        contentExcerpt: (blog.content || "").replace(/<[^>]*>?/gm, '').substring(0, 500)
      });
    }
  }

  // Sort and pick top 20
  candidatesRaw.sort((a, b) => b.score - a.score);
  const top20 = candidatesRaw.slice(0, 20);

  fs.writeFileSync(
    path.resolve(process.cwd(), "../../seo_phase5c_metadata_baseline.json"), 
    JSON.stringify(baseline, null, 2)
  );

  fs.writeFileSync(
    "C:\\Users\\mukun\\.gemini\\antigravity-ide\\brain\\76d58757-7674-4135-8447-6d89f0a69a1a\\scratch\\phase5c_candidates_raw.json", 
    JSON.stringify(top20, null, 2)
  );

  console.log(`Baseline extracted for ${baseline.length} articles.`);
  console.log(`Top 20 candidates extracted.`);
  process.exit(0);
}

run().catch(console.error);
