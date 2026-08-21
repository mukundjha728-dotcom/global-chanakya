require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const fs = require("fs");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const now = new Date().toISOString();
  
  // Load entity refs
  const conflicts = await db.collection("conflicts").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  const CF = {}; conflicts.forEach(e => CF[e.name] = e._id);
  console.log("Conflicts:", Object.keys(CF).join(", "));
  
  // ============================================================
  // STEP 3: CONFLICT LINKING
  // HIGH-confidence rules: article must explicitly name the conflict
  // in title OR tags. MEDIUM/LOW go to candidate report only.
  // ============================================================
  console.log("\n=== STEP 3: Conflict linking ===");
  
  const allBlogs = await db.collection("blogs").find(
    {status: {$in: ["published", "archived"]}},
    {projection:{_id:1,slug:1,title:1,tags:1,conflicts:1}}
  ).toArray();
  
  const conflictRules = [
    {
      conflictName: "South China Sea",
      conflictId: CF["South China Sea"],
      // HIGH: explicit name in title or specific tag
      highPatterns: [/south china sea/i],
      // MEDIUM patterns (for report only)
      mediumPatterns: [/taiwan strait/i, /scs\b/i, /spratly/i, /paracel/i]
    },
    {
      conflictName: "Ukraine War",
      conflictId: CF["Ukraine War"],
      highPatterns: [/ukraine war/i, /russia.ukraine/i, /ukraine.russia/i, /zelensky/i, /kyiv.*war/i, /war.*ukraine/i],
      mediumPatterns: [/ukraine/i, /kyiv/i, /donbas/i, /crimea/i]
    },
    {
      conflictName: "Gaza",
      conflictId: CF["Gaza"],
      highPatterns: [/\bgaza\b/i, /hamas/i, /gaza war/i, /israel.*hamas/i],
      mediumPatterns: [/west bank/i, /palestin/i, /idf/i]
    },
    {
      conflictName: "Myanmar Crisis",
      conflictId: CF["Myanmar Crisis"],
      highPatterns: [/myanmar civil war/i, /myanmar crisis/i, /tatmadaw/i, /myanmar resistance/i],
      mediumPatterns: [/myanmar/i, /burma/i]
    },
    {
      conflictName: "Yemen Civil War",
      conflictId: CF["Yemen Civil War"],
      highPatterns: [/yemen civil war/i, /houthi/i, /ansarallah/i, /yemen.*war/i],
      mediumPatterns: [/yemen/i, /red sea.*attack/i, /houthi.*attack/i]
    }
  ];
  
  const candidateReport = [];
  const conflictUpdates = [];
  
  for (const blog of allBlogs) {
    const existingConflicts = (blog.conflicts || []).map(x => x.toString());
    const text = (blog.title + " " + (blog.tags||[]).join(" ")).toLowerCase();
    const titleText = (blog.title||"").toLowerCase();
    const tagText = (blog.tags||[]).join(" ").toLowerCase();
    
    for (const rule of conflictRules) {
      const conflictIdStr = rule.conflictId.toString();
      if (existingConflicts.includes(conflictIdStr)) continue; // already linked
      
      let confidence = null;
      let evidence = "";
      
      // Check HIGH patterns against title OR tags
      for (const pat of rule.highPatterns) {
        if (pat.test(titleText)) {
          confidence = "HIGH";
          evidence = "Title match: " + pat.toString();
          break;
        }
        if (pat.test(tagText)) {
          confidence = "HIGH";
          evidence = "Tag match: " + pat.toString();
          break;
        }
      }
      
      // Check MEDIUM patterns (report only)
      if (!confidence) {
        for (const pat of rule.mediumPatterns) {
          if (pat.test(titleText)) {
            confidence = "MEDIUM";
            evidence = "Title match: " + pat.toString();
            break;
          }
          if (pat.test(tagText)) {
            confidence = "MEDIUM";
            evidence = "Tag match: " + pat.toString();
            break;
          }
        }
      }
      
      if (confidence) {
        candidateReport.push({
          slug: blog.slug,
          title: blog.title,
          conflict: rule.conflictName,
          confidence,
          evidence,
          recommendedAction: confidence === "HIGH" ? "AUTO-ASSIGN" : "HUMAN REVIEW"
        });
        
        if (confidence === "HIGH") {
          conflictUpdates.push({
            id: blog._id,
            slug: blog.slug,
            conflictId: rule.conflictId,
            conflictName: rule.conflictName,
            evidence
          });
        }
      }
    }
  }
  
  console.log("Conflict candidates total:", candidateReport.length);
  console.log("HIGH confidence (auto-assign):", conflictUpdates.length);
  console.log("MEDIUM/LOW (human review):", candidateReport.filter(c=>c.confidence!=="HIGH").length);
  
  // Write candidate report
  fs.writeFileSync("/tmp/phase4a_conflict_candidates.json", JSON.stringify(candidateReport, null, 2));
  
  // Auto-assign HIGH-confidence conflicts
  const conflictChangeLog = [];
  for (const update of conflictUpdates) {
    await db.collection("blogs").updateOne(
      {_id: update.id},
      {$addToSet: {conflicts: update.conflictId}}
    );
    conflictChangeLog.push({
      _id: update.id.toString(),
      slug: update.slug,
      action: "conflict_assigned",
      conflict: update.conflictName,
      evidence: update.evidence,
      timestamp: now
    });
    console.log("CONFLICT ASSIGNED:", update.slug, "->", update.conflictName);
  }
  
  fs.writeFileSync("/tmp/phase4a_change_manifest_step3.json", JSON.stringify(conflictChangeLog, null, 2));
  console.log("Step 3 complete. Conflict updates:", conflictChangeLog.length);
  
  await mongoose.connection.close();
}
run().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
