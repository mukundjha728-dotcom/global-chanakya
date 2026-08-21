require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const fs = require("fs");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  // FRESHNESS CANDIDATES
  const blogs = await db.collection("blogs").find(
    {status:"published"},
    {projection:{_id:1,slug:1,title:1,"seo.title":1,publishAt:1,tags:1}}
  ).toArray();
  
  const now = new Date("2026-08-20");
  const candidates = [];
  
  for (const b of blogs) {
    const title = (b.title || "").toLowerCase();
    const seoTitle = ((b.seo && b.seo.title) || "").toLowerCase();
    const tags = (b.tags||[]).join(" ").toLowerCase();
    const reasons = [];
    
    // September 30 expired event
    if (title.includes("september 30") || seoTitle.includes("september 30")) {
      reasons.push("Contains expired event date 'September 30' — article needs post-event update");
    }
    // "In 2025" in title — stale year
    if (title.match(/\b2025\b/) || seoTitle.match(/\b2025\b/)) {
      reasons.push("Contains year 2025 — may be stale reference");
    }
    // "Coming Into Force" — suggests future event
    if (title.includes("coming into force") || seoTitle.includes("coming into force")) {
      reasons.push("'Coming into force' suggests future event — verify if enacted");
    }
    // Age: articles over 60 days with "Watch in 2026" or "Flashpoints"
    const pubDate = new Date(b.publishAt);
    const daysOld = (now - pubDate) / 86400000;
    if (daysOld > 60 && (title.includes("watch") || title.includes("flashpoint") || title.includes("brink"))) {
      reasons.push("Event-framed article is " + Math.round(daysOld) + " days old — verify current relevance");
    }
    // "Trump" + "2025" predications
    if (tags.includes("trump") && tags.includes("2025")) {
      reasons.push("Trump-related article with 2025 tag — may be stale predictions");
    }
    
    if (reasons.length > 0) {
      candidates.push({
        slug: b.slug,
        title: b.title,
        seoTitle: b.seo && b.seo.title,
        publishAt: b.publishAt,
        daysOld: Math.round(daysOld),
        reasons,
        priority: reasons.length >= 2 ? "HIGH" : "MEDIUM"
      });
    }
  }
  
  candidates.sort((a,b) => b.reasons.length - a.reasons.length || b.daysOld - a.daysOld);
  
  fs.writeFileSync("/tmp/phase4a_freshness_candidates.json", JSON.stringify(candidates, null, 2));
  console.log("Freshness candidates:", candidates.length);
  candidates.forEach(c => console.log(c.priority, c.slug));
  
  // CONFLICT CANDIDATES REPORT (all including MEDIUM/LOW)
  const conflictCandidates = JSON.parse(fs.readFileSync("/tmp/phase4a_conflict_candidates.json","utf8"));
  console.log("\nConflict candidates total:", conflictCandidates.length);
  console.log("HIGH:", conflictCandidates.filter(c=>c.confidence==="HIGH").length);
  console.log("MEDIUM:", conflictCandidates.filter(c=>c.confidence==="MEDIUM").length);
  
  await mongoose.connection.close();
}
run().catch(e => { console.error("FATAL:", e); process.exit(1); });
