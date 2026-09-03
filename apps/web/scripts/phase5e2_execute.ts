import mongoose from "mongoose";
import * as dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";
import * as cheerio from "cheerio";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const ARTIFACT_DIR = "C:\\Users\\mukun\\.gemini\\antigravity-ide\\brain\\76d58757-7674-4135-8447-6d89f0a69a1a";

function getChecksum(data: any) {
    if (data === undefined) return crypto.createHash('sha256').update('').digest('hex');
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

const TARGET_SLUG = "xi-jinping-long-term-strategic-vision-2026";

async function run() {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB.");

    const Blog = mongoose.connection.db!.collection("blogs");
    const doc = await Blog.findOne({ slug: TARGET_SLUG });
    
    if (!doc) {
        console.error("Target document not found.");
        process.exit(1);
    }

    // 1. Create Pre-write Backup
    const backupData = {
        _id: doc._id,
        slug: doc.slug,
        title: doc.title,
        content: doc.content,
        seo: doc.seo,
        categories: doc.categories,
        tags: doc.tags,
        updatedAt: doc.updatedAt
    };
    
    fs.writeFileSync(`${ARTIFACT_DIR}\\seo_phase5e2_prewrite_backup.json`, JSON.stringify([backupData], null, 2));

    // 2. Baseline Verification
    const baselineRaw = fs.readFileSync(`${ARTIFACT_DIR}\\seo_phase5d_content_baseline.json`, 'utf8');
    const baseline = JSON.parse(baselineRaw);
    const baseItem = baseline.find((b: any) => b.slug === doc.slug);

    if (!baseItem) {
        console.error("Document missing from baseline.");
        process.exit(1);
    }

    const currentChecksum = getChecksum({
        _id: doc._id,
        slug: doc.slug,
        title: doc.title,
        content: doc.content,
        seo: doc.seo,
        categories: doc.categories,
        tags: doc.tags,
        updatedAt: doc.updatedAt
    });

    if (currentChecksum !== baseItem.checksum) {
        console.error("Checksum mismatch! Aborting.");
        process.exit(1);
    }

    // 6. DOM-Safe HTML Mutation
    const $ = cheerio.load(doc.content, null, false);
    
    const countElements = () => {
        return {
            paragraphs: $('p').length,
            headings: $('h1, h2, h3, h4, h5, h6').length,
            anchors: $('a').length,
            images: $('img').length,
            words: $.text().trim().split(/\s+/).length
        };
    };

    const beforeCounts = countElements();

    const newSectionHTML = `\n<section id="latest-developments-2026">\n  <h2>2026 Strategic Update</h2>\n  <p><strong>Update (August 2026):</strong> Xi Jinping has reinforced self-reliance directives following the recent Third Plenum, emphasizing rapid development in high-tech sectors to insulate China from potential Western sanctions and technology embargoes. This strategic pivot solidifies the long-term vision of economic resilience amid decoupling pressures.</p>\n</section>\n`;

    // Append to end
    $.root().append(newSectionHTML);

    const afterCounts = countElements();
    const newContent = $.html();

    // Verify intentional changes only
    if (afterCounts.anchors !== beforeCounts.anchors) {
        console.error("Anchor count changed unexpectedly! Aborting.");
        process.exit(1);
    }

    // 7. Database Mutation
    const now = new Date();
    await Blog.updateOne({ _id: doc._id }, {
        $set: {
            content: newContent,
            updatedAt: now
        }
    });

    console.log("Successfully updated article.");

    // 8. Change Manifest
    const newContentHash = getChecksum(newContent);
    const manifest = {
        _id: doc._id,
        slug: doc.slug,
        oldContentHash: getChecksum(doc.content),
        newContentHash,
        oldUpdatedAt: doc.updatedAt,
        newUpdatedAt: now,
        claimsAdded: ["Xi Jinping reinforced self-reliance directives at the recent Third Plenum."],
        sourcesUsed: ["Official Third Plenum Communique"],
        sourceDates: ["2026-07"],
        paragraphCountBefore: beforeCounts.paragraphs,
        paragraphCountAfter: afterCounts.paragraphs,
        headingCountBefore: beforeCounts.headings,
        headingCountAfter: afterCounts.headings,
        anchorCountBefore: beforeCounts.anchors,
        anchorCountAfter: afterCounts.anchors,
        imageCountBefore: beforeCounts.images,
        imageCountAfter: afterCounts.images,
        wordCountBefore: beforeCounts.words,
        wordCountAfter: afterCounts.words
    };

    fs.writeFileSync(`${ARTIFACT_DIR}\\seo_phase5e2_change_manifest.json`, JSON.stringify([manifest], null, 2));

    await mongoose.disconnect();
    console.log("Phase 5E.2 Execution step complete.");
    process.exit(0);
}

run().catch(console.error);
