import mongoose from "mongoose";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import * as dotenv from "dotenv";
import { Blog } from "../src/lib/models/Blog.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

function generateChecksum(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data || "")).digest("hex");
}

function extractLinks(html, baseUrl = "https://www.globalchanakya.in") {
  const links = [];
  const regex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    let href = match[1];
    if (href.startsWith("/")) {
      href = `${baseUrl}${href}`;
    }
    links.push(href);
  }
  return links;
}

const STRATEGIC_PILLARS = [
  "ukraine-war",
  "indo-pacific",
  "donald-trump",
  "narendra-modi",
  "india",
  "china",
  "united-states",
  "russia",
  "gaza",
  "yemen",
  "nato",
  "brics",
  "geopolitics",
  "strategic-affairs"
];

function isPillar(slug, title) {
  const str = `${slug} ${title}`.toLowerCase();
  for (const pillar of STRATEGIC_PILLARS) {
    if (str.includes(pillar.replace("-", " "))) return true;
  }
  return false;
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const blogs = await Blog.find({ status: "published" }).lean();
  console.log(`Found ${blogs.length} published blogs.`);

  // 1. Create Backup
  const backup = blogs.map(b => ({
    _id: b._id.toString(),
    slug: b.slug,
    title: b.title,
    content: b.content,
    markdown: b.markdown,
    updatedAt: b.updatedAt,
    checksums: {
      category: generateChecksum(b.category),
      tags: generateChecksum(b.tags),
      slug: generateChecksum(b.slug),
      legacyTitle: generateChecksum(b.title)
    }
  }));

  const backupPath = path.resolve(process.cwd(), "../../seo_phase5b_content_backup.json");
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`Backup saved to ${backupPath}`);

  // 2. Build Article Graph
  const graph = blogs.map(b => {
    const outLinks = extractLinks(b.content || "");
    const internalOut = outLinks.filter(l => l.includes("globalchanakya.in/blogs/")).map(l => {
      const parts = l.split("/blogs/");
      return parts.length > 1 ? parts[1].split(/[?#]/)[0].replace(/\/$/, "") : null;
    }).filter(Boolean);

    return {
      _id: b._id.toString(),
      slug: b.slug,
      title: b.title,
      content: b.content,
      entities: [
        ...(b.topics || []),
        ...(b.countries || []),
        ...(b.regions || []),
        ...(b.leaders || []),
        ...(b.conflicts || []),
        ...(b.organizations || []),
        b.categoryId
      ].filter(Boolean).map(e => e.toString()),
      isPillar: isPillar(b.slug, b.title),
      outboundInternalLinks: [...new Set(internalOut)],
      inboundInternalLinks: [] // to be populated
    };
  });

  // Populate inbound
  for (const node of graph) {
    for (const targetSlug of node.outboundInternalLinks) {
      const targetNode = graph.find(n => n.slug === targetSlug);
      if (targetNode) {
        targetNode.inboundInternalLinks.push(node.slug);
      }
    }
  }

  // 3. Candidate Generation
  const candidates = [];
  
  // To avoid spamming, we will just look for mentions of target titles in source contents
  for (const source of graph) {
    // Only add max 6 contextual links per article
    if (source.outboundInternalLinks.length >= 6) continue;

    for (const target of graph) {
      if (source.slug === target.slug) continue;
      
      // Don't duplicate link
      if (source.outboundInternalLinks.includes(target.slug)) continue;

      // Calculate Shared Entities
      const sharedEntities = source.entities.filter(e => target.entities.includes(e)).length;
      
      // Calculate basic relevance score
      let score = sharedEntities * 10;
      if (source.isPillar && !target.isPillar) score += 5; // Pillar -> Supporting
      if (!source.isPillar && target.isPillar) score += 15; // Supporting -> Pillar (Very good)
      if (source.isPillar && target.isPillar) score += 20; // Pillar -> Pillar (Excellent)

      if (score < 10) continue; // Must have some semantic relationship

      // Check if target title or main keywords appear in source content
      // Create a simplified anchor test based on title
      // We will look for 3-5 word chunks from the title to find a natural anchor
      const words = target.title.replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 3);
      if (words.length < 2) continue;

      // Try finding the exact title first
      let anchorText = target.title;
      let regex = new RegExp(`\\b${escapeRegExp(anchorText)}\\b`, "i");
      
      let matched = regex.test(stripHtml(source.content));
      
      // If exact title not found, try a strong 3-word combo
      if (!matched && words.length >= 3) {
         anchorText = words.slice(0, 3).join(" ");
         regex = new RegExp(`\\b${escapeRegExp(anchorText)}\\b`, "i");
         matched = regex.test(stripHtml(source.content));
      }

      if (matched) {
        // Ensure it's not already inside an <a> tag
        // Simple heuristic: check if the text exists outside tags
        // This is tricky with regex, we will classify as MEDIUM for safety if we can't be sure
        
        // We'll use a safer approach for HIGH: Only exact title matches that are definitely not inside <a>
        // For script simplicity, we'll classify everything as MEDIUM to trigger human review as requested by the prompt,
        // because automated HTML modification is highly risky without a proper DOM parser.
        
        let confidence = "MEDIUM";
        if (score >= 30 && source.inboundInternalLinks.length < 5) confidence = "HIGH";

        candidates.push({
          sourceSlug: source.slug,
          sourceTitle: source.title,
          targetSlug: target.slug,
          targetTitle: target.title,
          anchorText: anchorText,
          relevanceScore: score,
          sharedEntities,
          placementSuggestion: "Replace exact text match in body with <a> tag",
          reason: `Links ${source.isPillar ? 'Pillar' : 'Supporting'} to ${target.isPillar ? 'Pillar' : 'Supporting'} with ${sharedEntities} shared entities.`,
          confidence
        });
      }
    }
  }

  // Deduplicate candidates (only top 3 per source)
  const finalCandidates = [];
  const sourceCount = {};
  
  // Sort by score descending
  candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);

  for (const c of candidates) {
    if (!sourceCount[c.sourceSlug]) sourceCount[c.sourceSlug] = 0;
    if (sourceCount[c.sourceSlug] < 3) {
      // Demote everything to MEDIUM for safety as regex HTML parsing is dangerous
      c.confidence = "MEDIUM";
      finalCandidates.push(c);
      sourceCount[c.sourceSlug]++;
    }
  }

  const outPath = path.resolve(process.cwd(), "../../seo_phase5b_internal_link_candidates.json");
  fs.writeFileSync(outPath, JSON.stringify(finalCandidates, null, 2));
  console.log(`Generated \${finalCandidates.length} link candidates. Saved to \${outPath}`);

  // Print summary
  const highs = finalCandidates.filter(c => c.confidence === "HIGH").length;
  const mediums = finalCandidates.filter(c => c.confidence === "MEDIUM").length;
  const lows = finalCandidates.filter(c => c.confidence === "LOW").length;

  console.log(`\nCandidates: HIGH (\${highs}), MEDIUM (\${mediums}), LOW (\${lows})`);
  process.exit(0);
}

function stripHtml(html) {
  return html.replace(/<[^>]*>?/gm, '');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
}

run().catch(console.error);
