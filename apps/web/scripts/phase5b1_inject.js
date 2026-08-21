import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import crypto from "crypto";
import * as dotenv from "dotenv";

import { Blog } from "../src/lib/models/Blog.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const DRY_RUN = !process.argv.includes("--apply");

function generateChecksum(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data || "")).digest("hex");
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function injectLink(html, anchorText, targetSlug) {
  const $ = cheerio.load(html, null, false);
  let injected = false;
  
  // Also ensure destination doesn't already exist in the HTML
  let alreadyExists = false;
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && (href.includes(targetSlug) || href.includes(encodeURIComponent(targetSlug)))) {
      alreadyExists = true;
    }
  });

  if (alreadyExists) {
    return { html, injected: false, reason: "Target already linked in article" };
  }

  function traverse(node) {
    if (injected) return;
    
    if (node.type === 'text') {
      const regex = new RegExp(`\\b${escapeRegExp(anchorText)}\\b`);
      if (regex.test(node.data)) {
        const matchStr = node.data.match(regex)[0];
        const index = node.data.search(regex);
        
        // Escape the parts to avoid XSS/HTML injection from plain text
        const before = node.data.substring(0, index).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const after = node.data.substring(index + matchStr.length).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        const newHtml = `${before}<a href="/blogs/${targetSlug}">${matchStr}</a>${after}`;
        $(node).replaceWith(newHtml);
        injected = true;
      }
    } else if (node.type === 'tag') {
      const tagName = node.name.toLowerCase();
      if (['a', 'script', 'style', 'code', 'pre', 'noscript'].includes(tagName)) {
        return; // Skip these tags entirely
      }
      if (node.children) {
        const children = [...node.children];
        for (const child of children) {
          traverse(child);
        }
      }
    }
  }

  const rootNodes = [...$.root()[0].children];
  for (const child of rootNodes) {
    traverse(child);
  }
  
  // Important: Cheerio's `false` flag preserves the body/head omission, but it does encode HTML entities if we're not careful.
  // Using $.html() on the root should preserve most original formatting.
  return { html: $.html(), injected, reason: injected ? "Success" : "Anchor text not found in safe text nodes" };
}

async function run() {
  if (DRY_RUN) console.log("--- DRY RUN MODE ---");
  else console.log("!!! APPLY MODE !!!");

  await mongoose.connect(MONGODB_URI);
  
  const candidatesPath = path.resolve(process.cwd(), "../../seo_phase5b_internal_link_candidates.json");
  const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf-8"));
  
  const backupPath = path.resolve(process.cwd(), "../../seo_phase5b_prewrite_content_backup.json");
  const manifestPath = path.resolve(process.cwd(), "../../seo_phase5b_change_manifest.json");
  
  const manifest = [];
  const backup = [];

  let approved = 0;
  let rejected = 0;

  for (const c of candidates) {
    console.log(`\nEvaluating: ${c.sourceSlug} -> ${c.targetSlug} [Anchor: "${c.anchorText}"]`);
    
    const blog = await Blog.findOne({ slug: c.sourceSlug });
    if (!blog) {
      console.log("REJECTED: Source blog not found.");
      rejected++;
      continue;
    }

    const targetBlog = await Blog.findOne({ slug: c.targetSlug });
    if (!targetBlog || targetBlog.status !== "published") {
      console.log("REJECTED: Target blog not found or not published.");
      rejected++;
      continue;
    }

    const oldHtml = blog.content;
    const { html: newHtml, injected, reason } = injectLink(oldHtml, c.anchorText, c.targetSlug);

    if (!injected) {
      console.log(`REJECTED: ${reason}`);
      rejected++;
      continue;
    }

    // Verify content integrity using rough string length/tag counts
    const oldA = (oldHtml.match(/<a /gi) || []).length;
    const newA = (newHtml.match(/<a /gi) || []).length;
    
    if (newA !== oldA + 1) {
      console.log(`REJECTED: Integrity check failed. Anchor count discrepancy. Old: ${oldA}, New: ${newA}`);
      rejected++;
      continue;
    }

    const oldP = (oldHtml.match(/<p[ >]/gi) || []).length;
    const newP = (newHtml.match(/<p[ >]/gi) || []).length;

    if (oldP !== newP) {
       console.log(`REJECTED: Integrity check failed. Paragraph count discrepancy.`);
       rejected++;
       continue;
    }

    console.log(`APPROVED: Insertion successful.`);
    approved++;

    const oldHash = generateChecksum(oldHtml);
    const newHash = generateChecksum(newHtml);

    // Track backup
    backup.push({
      _id: blog._id.toString(),
      slug: blog.slug,
      title: blog.title,
      originalContent: oldHtml,
      originalHash: oldHash
    });

    manifest.push({
      _id: blog._id.toString(),
      sourceSlug: blog.slug,
      targetSlug: c.targetSlug,
      anchorText: c.anchorText,
      oldContentHash: oldHash,
      newContentHash: newHash,
      reason: "High confidence human-verified injection",
      timestamp: new Date().toISOString()
    });

    if (!DRY_RUN) {
      await Blog.updateOne(
        { _id: blog._id },
        { $set: { content: newHtml } }
      );
      console.log("-> Written to MongoDB.");
    }
  }

  console.log(`\nTotal Candidates: ${candidates.length}`);
  console.log(`Approved & Safe: ${approved}`);
  console.log(`Rejected: ${rejected}`);

  if (DRY_RUN && approved > 0) {
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\nDry run completed. Run with --apply to commit these ${approved} changes.`);
  }

  process.exit(0);
}

run().catch(console.error);
