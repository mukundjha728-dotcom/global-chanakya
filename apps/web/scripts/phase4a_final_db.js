require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const fs = require("fs");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const now = new Date().toISOString();
  
  const manifest = [];
  
  // 1. REVERT THE 11 DOWNGRADED/REMOVED CONFLICTS
  const conflicts = await db.collection("conflicts").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  const CF = {}; conflicts.forEach(e => CF[e.name] = e._id);
  
  const pullList = [
    { slug: "proxy-warfare-cheapest-way-fight-global-wars-iran-russia-china", conflict: "Ukraine War" },
    { slug: "proxy-warfare-cheapest-way-fight-global-wars-iran-russia-china", conflict: "Yemen Civil War" },
    { slug: "strategic-risk-simultaneous-multi-theatre-wars-analysis", conflict: "Ukraine War" },
    { slug: "global-food-security-risks-war-geopolitical-analysis", conflict: "Ukraine War" },
    { slug: "global-supply-chain-risks-2026-geopolitics-trade-disruption", conflict: "Ukraine War" },
    { slug: "red-sea-crisis-world-trade-geopolitics-houthi-shipping", conflict: "Ukraine War" },
    { slug: "recep-tayyip-erdogan-strategic-role-2026", conflict: "Ukraine War" },
    { slug: "olaf-scholz-germany-military-repositioning-zeitenwende", conflict: "Ukraine War" },
    { slug: "donald-trump-foreign-policy-predictions-2026", conflict: "Ukraine War" },
    { slug: "united-states-strategic-intelligence-report-2026", conflict: "Ukraine War" },
    { slug: "red-sea-crisis-global-trade-impact-2026", conflict: "Gaza" }
  ];
  
  let reverted = 0;
  for (const p of pullList) {
    const article = await db.collection("blogs").findOne({slug: p.slug});
    if (article) {
       const cid = CF[p.conflict];
       if (article.conflicts && article.conflicts.some(id => id.toString() === cid.toString())) {
          await db.collection("blogs").updateOne({_id: article._id}, {$pull: {conflicts: cid}});
          reverted++;
          console.log(`Reverted downgraded conflict ${p.conflict} from ${p.slug}`);
       }
    }
  }
  
  // 2. ORPHAN RECOVERY MANIFEST (since we already did it, we just load the manifest from step2 or reconstruct)
  if (fs.existsSync("/tmp/phase4a_change_manifest_step2.json")) {
      const orphans = JSON.parse(fs.readFileSync("/tmp/phase4a_change_manifest_step2.json", "utf8"));
      for (const change of orphans) {
          manifest.push({
             _id: change._id,
             slug: change.slug,
             changeType: "ENTITY_RELATIONSHIP",
             before: change.oldRelationships,
             after: change.newRelationships,
             reason: "Orphan entity recovery: " + change.reason,
             timestamp: change.timestamp
          });
      }
  }
  
  // 3. CONFLICT LINKS MANIFEST (only the 18 KEEP_HIGH)
  if (fs.existsSync("/tmp/phase4a_change_manifest_step3.json")) {
      const allConflicts = JSON.parse(fs.readFileSync("/tmp/phase4a_change_manifest_step3.json", "utf8"));
      // filter out the pullList
      const keepConflicts = allConflicts.filter(c => {
         return !pullList.some(p => p.slug === c.slug && p.conflict === c.conflict);
      });
      for (const change of keepConflicts) {
          manifest.push({
             _id: change._id,
             slug: change.slug,
             changeType: "ENTITY_RELATIONSHIP",
             before: { conflicts: "Unknown before state (added to set)" },
             after: { conflicts: [change.conflict] },
             reason: "HIGH-confidence conflict assignment: " + change.evidence,
             timestamp: change.timestamp
          });
      }
  }
  
  // 4. TITLE / DESC OPTIMIZATION MANIFEST
  if (fs.existsSync("/tmp/phase4a_change_manifest_step6.json")) {
      const descs = JSON.parse(fs.readFileSync("/tmp/phase4a_change_manifest_step6.json", "utf8"));
      for (const change of descs) {
          manifest.push({
             _id: change._id,
             slug: change.slug,
             changeType: "SEO_DESCRIPTION",
             before: change.oldDescription,
             after: change.newDescription,
             reason: "Phase 4A SEO description optimization: " + change.reason,
             timestamp: change.timestamp
          });
      }
  }
  
  // 5. ARCHIVE DUPLICATE MANIFEST
  if (fs.existsSync("/tmp/phase4a_change_manifest_step7.json")) {
      const dup = JSON.parse(fs.readFileSync("/tmp/phase4a_change_manifest_step7.json", "utf8"));
      manifest.push({
         _id: dup._id,
         slug: dup.slug,
         changeType: "STATUS_ARCHIVE",
         before: dup.oldStatus,
         after: dup.newStatus,
         reason: dup.reason,
         timestamp: dup.timestamp
      });
  }
  
  // 6. IMAGE METADATA MANIFEST (documented that we handle via code, no db changes)
  manifest.push({
     _id: "N/A",
     slug: "ALL_GSTATIC_IMAGES",
     changeType: "IMAGE_METADATA",
     before: "gstatic urls generated in OG tags",
     after: "sanitizeOgImageUrl strips them from OG tags to fallback safely",
     reason: "Gstatic hotlinks return 403 to crawlers. Safe code fallback implemented instead of blind replacement.",
     timestamp: now
  });
  
  fs.writeFileSync("seo_phase4a_change_manifest.json", JSON.stringify(manifest, null, 2));
  console.log(`Manifest written with ${manifest.length} total changes.`);
  console.log(`Reverted ${reverted} downgraded conflicts.`);
  
  await mongoose.connection.close();
}
run().catch(console.error);
