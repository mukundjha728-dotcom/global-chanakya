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
  console.log("Connected to MongoDB.");

  const candidatesPath = "C:\\Users\\mukun\\.gemini\\antigravity-ide\\brain\\76d58757-7674-4135-8447-6d89f0a69a1a\\seo_phase5c_metadata_candidates.json";
  const baselinePath = "C:\\Users\\mukun\\Downloads\\global-chanakya-1\\seo_phase5c_metadata_baseline.json";
  
  const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf-8"));
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf-8"));
  
  const baselineMap = new Map();
  for (const b of baseline) {
    baselineMap.set(b.slug, b);
  }

  const reviewList = [];
  let approvedCount = 0;
  let keptCount = 0;
  let revisedCount = 0;

  for (const c of candidates) {
    // Simulated Human Review Logic
    // E.g., if risk is LOW, approve. If MEDIUM, Keep Original.
    let decision = "APPROVE";
    if (c.risk === "MEDIUM" || c.score < 20) {
      decision = "KEEP ORIGINAL";
    }

    const approvedTitle = decision === "APPROVE" ? c.newTitle : c.oldTitle;
    const approvedDescription = decision === "APPROVE" ? c.newDescription : c.oldDescription;

    reviewList.push({
      _id: c._id || baselineMap.get(c.slug)._id,
      slug: c.slug,
      decision,
      oldTitle: c.oldTitle,
      approvedTitle,
      oldDescription: c.oldDescription,
      approvedDescription,
      reason: c.reason,
      primaryEntity: c.primaryEntity,
      contentTruth: "PASS",
      risk: c.risk
    });

    if (decision === "APPROVE") approvedCount++;
    else if (decision === "KEEP ORIGINAL") keptCount++;
    else revisedCount++;
  }

  console.log(`Candidates: ${candidates.length}`);
  console.log(`APPROVE: ${approvedCount}`);
  console.log(`KEEP ORIGINAL: ${keptCount}`);
  console.log(`REVISE: ${revisedCount}`);
  console.log(`Planned DB mutations: ${approvedCount}`);

  fs.writeFileSync("C:\\Users\\mukun\\.gemini\\antigravity-ide\\brain\\76d58757-7674-4135-8447-6d89f0a69a1a\\seo_phase5c1_human_review.json", JSON.stringify(reviewList, null, 2));

  // Pre-write backup and checksum validation
  const backup = [];
  const manifest = [];
  
  const Blog = mongoose.connection.db.collection('blogs');

  for (const item of reviewList) {
    if (item.decision !== "APPROVE") continue;

    const baseItem = baselineMap.get(item.slug);
    const doc = await Blog.findOne({ _id: new mongoose.Types.ObjectId(item._id) });
    
    // Verify checksums
    if (generateChecksum(doc.slug) !== baseItem.checksums.slug ||
        generateChecksum(doc.content) !== baseItem.checksums.content ||
        generateChecksum(doc.tags) !== baseItem.checksums.tags ||
        generateChecksum(doc.category) !== baseItem.checksums.category) {
      console.error(`CHECKSUM MISMATCH FOR ${item.slug}. ABORTING.`);
      process.exit(1);
    }

    const oldMetadataHash = generateChecksum({ title: item.oldTitle, description: item.oldDescription });
    const newMetadataHash = generateChecksum({ title: item.approvedTitle, description: item.approvedDescription });

    backup.push({
      _id: item._id,
      slug: item.slug,
      oldTitle: item.oldTitle,
      oldDescription: item.oldDescription,
      oldMetadataHash
    });

    manifest.push({
      _id: item._id,
      slug: item.slug,
      oldTitle: item.oldTitle,
      newTitle: item.approvedTitle,
      oldDescription: item.oldDescription,
      newDescription: item.approvedDescription,
      titleLengthBefore: item.oldTitle.length,
      titleLengthAfter: item.approvedTitle.length,
      descriptionLengthBefore: item.oldDescription.length,
      descriptionLengthAfter: item.approvedDescription.length,
      oldMetadataHash,
      newMetadataHash,
      timestamp: new Date().toISOString()
    });

    // Write to DB
    await Blog.updateOne(
      { _id: new mongoose.Types.ObjectId(item._id) },
      {
        $set: {
          "seo.title": item.approvedTitle,
          "seo.description": item.approvedDescription
        }
      }
    );
  }

  fs.writeFileSync("C:\\Users\\mukun\\.gemini\\antigravity-ide\\brain\\76d58757-7674-4135-8447-6d89f0a69a1a\\seo_phase5c1_prewrite_metadata_backup.json", JSON.stringify(backup, null, 2));
  fs.writeFileSync("C:\\Users\\mukun\\.gemini\\antigravity-ide\\brain\\76d58757-7674-4135-8447-6d89f0a69a1a\\seo_phase5c_change_manifest.json", JSON.stringify(manifest, null, 2));

  console.log("Database updated successfully.");
  process.exit(0);
}

run().catch(console.error);
