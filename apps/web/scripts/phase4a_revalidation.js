require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const fs = require("fs");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  if (!fs.existsSync("/tmp/phase4a_change_manifest_step3.json")) {
     console.log("Error: candidates not found at /tmp/phase4a_change_manifest_step3.json");
     process.exit(1);
  }
  const assigned = JSON.parse(fs.readFileSync("/tmp/phase4a_change_manifest_step3.json", "utf8"));
  
  const slugsToFetch = assigned.map(a => a.slug);
  const blogs = await db.collection("blogs").find(
     {slug: {$in: slugsToFetch}},
     {projection: {slug: 1, title: 1, tags: 1, category: 1, "seo.keywords": 1, excerpt: 1}}
  ).toArray();

  const blogMap = {};
  blogs.forEach(b => blogMap[b.slug] = b);

  let keepHigh = 0;
  let downgradeMedium = 0;
  let remove = 0;
  
  const report = [
    "# PHASE 4A — CONFLICT REVALIDATION",
    "**Generated:** " + new Date().toISOString().split("T")[0],
    "**Platform:** https://www.globalchanakya.in/",
    "",
    "## REVALIDATION SUMMARY",
    "| Metric | Count |",
    "|--------|-------|",
    "| Original HIGH candidates | " + assigned.length + " |",
    "| KEEP_HIGH | __KEEP__ |",
    "| DOWNGRADE_MEDIUM | __DOWNGRADE__ |",
    "| REMOVE | __REMOVE__ |",
    "| Final HIGH candidates | __FINAL__ |",
    "",
    "## DETAILED REVALIDATION",
    ""
  ];

  for (const c of assigned) {
     const b = blogMap[c.slug];
     if (!b) continue;

     let decision = "KEEP_HIGH";
     let reason = "Primary conflict";

     if (
         c.slug.includes("global-food-security") || 
         c.slug.includes("global-supply-chain") ||
         c.slug.includes("recep-tayyip-erdogan") ||
         c.slug.includes("donald-trump-foreign-policy") ||
         c.slug.includes("united-states-strategic-intelligence") ||
         c.slug.includes("olaf-scholz-germany") ||
         c.slug.includes("proxy-warfare-cheapest-way-fight") ||
         c.slug.includes("strategic-risk-simultaneous") ||
         c.slug.includes("red-sea-crisis-world-trade") ||
         c.slug.includes("red-sea-crisis-global-trade") ||
         c.slug.includes("hormuz-black-sea-chokepoints")
     ) {
         if (c.slug.includes("global-food") || c.slug.includes("global-supply")) {
             decision = "DOWNGRADE_MEDIUM";
             reason = "Article is about economics/supply chains, conflict is secondary cause/context";
         } else if (c.slug.includes("recep-tayyip-erdogan") || c.slug.includes("donald-trump") || c.slug.includes("olaf-scholz") || c.slug.includes("zelensky-vs-putin")) {
             decision = "DOWNGRADE_MEDIUM";
             reason = "Article is a leader profile / foreign policy review; conflict is geopolitical context";
         } else if (c.slug.includes("united-states-strategic-intelligence")) {
              decision = "DOWNGRADE_MEDIUM";
              reason = "Article is a broad strategic intelligence report; conflict is just one theatre";
         } else if (c.slug.includes("proxy-warfare-cheapest-way-fight") || c.slug.includes("strategic-risk-simultaneous")) {
              decision = "DOWNGRADE_MEDIUM";
              reason = "Article is about warfare doctrine or multi-theatre risk; specific conflicts are examples";
         } else if (c.slug.includes("hormuz-black-sea-chokepoints")) {
              decision = "KEEP_HIGH";
              reason = "The conflict directly dictates the chokepoint weaponization which is the primary subject.";
         } else if (c.slug.includes("red-sea-crisis-world-trade") || c.slug.includes("red-sea-crisis-global-trade")) {
              if (c.conflict === "Gaza") {
                  decision = "DOWNGRADE_MEDIUM";
                  reason = "Gaza is the catalyst, but the Red Sea Crisis/Houthi attacks (Yemen) are the primary subject/theatre.";
              } else if (c.conflict === "Yemen Civil War") {
                  decision = "KEEP_HIGH";
                  reason = "The Houthi Red Sea crisis is a direct, primary theatre of this conflict.";
              } else if (c.conflict === "Ukraine War") {
                   decision = "REMOVE";
                   reason = "Ukraine grain is a minor mention in an article primarily about the Red Sea.";
              }
         }
     }

     if (decision === "KEEP_HIGH") keepHigh++;
     else if (decision === "DOWNGRADE_MEDIUM") downgradeMedium++;
     else if (decision === "REMOVE") remove++;

     report.push("### " + c.slug);
     report.push("- **Proposed Conflict:** " + c.conflict);
     report.push("- **Evidence:** " + c.evidence);
     report.push("- **Decision:** " + decision);
     if (decision !== "KEEP_HIGH") {
         report.push("- **Reason:** " + reason);
     }
     report.push("");
  }

  const finalStr = report.join("\n")
        .replace("__KEEP__", keepHigh)
        .replace("__DOWNGRADE__", downgradeMedium)
        .replace("__REMOVE__", remove)
        .replace("__FINAL__", keepHigh);

  fs.writeFileSync("seo_phase4a_conflict_revalidation.md", finalStr);
  console.log("Revalidation generated. Keep:", keepHigh, "Downgrade:", downgradeMedium, "Remove:", remove);
  await mongoose.connection.close();
}
run().catch(console.error);
