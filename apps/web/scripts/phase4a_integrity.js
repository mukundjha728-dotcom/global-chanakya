require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const crypto = require("crypto");
const fs = require("fs");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const PRE_CHECKSUMS = {
    category: "058cbc5d0e8a0924ae1fb16e9c0e15157437a71dcfa24cf294b58ca4f575322b",
    tags: "2590edbce93e5af8507183076df055794f94c748364f101549c58324fc15b92f",
    slug: "ec63ec3ca98e239c3286323032aa442e530f918faf1f28371f0bf1ca2aff0fee",
    title: "86b07cd13f007565df7642c57ded82c3899249ce454df0ded4555136bc811b56"
  };
  
  // Count all blogs
  const totalAll = await db.collection("blogs").countDocuments({});
  const totalPub = await db.collection("blogs").countDocuments({status:"published"});
  const totalArchived = await db.collection("blogs").countDocuments({status:"archived"});
  const totalDraft = await db.collection("blogs").countDocuments({status:"draft"});
  
  console.log("Total blogs:", totalAll, "(pub:", totalPub, "arch:", totalArchived, "draft:", totalDraft+")");
  
  // Re-compute checksums on PUBLISHED articles only (original baseline was on published)
  const blogs = await db.collection("blogs").find({status:"published"},{
    projection:{_id:1,slug:1,title:1,category:1,tags:1}
  }).toArray();
  
  const categoryStr = blogs.map(b=>b.category||"").sort().join("|");
  const tagsStr = blogs.map(b=>(b.tags||[]).sort().join(",")).sort().join("|");
  const slugStr = blogs.map(b=>b.slug||"").sort().join("|");
  const titleStr = blogs.map(b=>b.title||"").sort().join("|");
  
  const postChecksums = {
    category: crypto.createHash("sha256").update(categoryStr).digest("hex"),
    tags: crypto.createHash("sha256").update(tagsStr).digest("hex"),
    slug: crypto.createHash("sha256").update(slugStr).digest("hex"),
    title: crypto.createHash("sha256").update(titleStr).digest("hex"),
  };
  
  console.log("\n=== CHECKSUM VERIFICATION ===");
  let allMatch = true;
  for (const field of ["category", "tags", "slug", "title"]) {
    const match = PRE_CHECKSUMS[field] === postChecksums[field];
    console.log(field, match ? "✅ MATCH" : "❌ MISMATCH");
    if (!match) {
      allMatch = false;
      console.log("  PRE: ", PRE_CHECKSUMS[field]);
      console.log("  POST:", postChecksums[field]);
    }
  }
  
  // Check orphan count
  const all = await db.collection("blogs").find({status:"published"},{
    projection:{topics:1,countries:1,leaders:1,conflicts:1,organizations:1}
  }).toArray();
  const orphans = all.filter(b => {
    return (b.topics||[]).length===0 && (b.countries||[]).length===0 && 
           (b.leaders||[]).length===0 && (b.conflicts||[]).length===0 && 
           (b.organizations||[]).length===0;
  });
  console.log("\nOrphans remaining:", orphans.length);
  
  // Check no broken ObjectId refs
  const topicIds = new Set((await db.collection("topics").find({},{projection:{_id:1}}).toArray()).map(t=>t._id.toString()));
  const countryIds = new Set((await db.collection("countries").find({},{projection:{_id:1}}).toArray()).map(t=>t._id.toString()));
  const leaderIds = new Set((await db.collection("leaders").find({},{projection:{_id:1}}).toArray()).map(t=>t._id.toString()));
  const conflictIds = new Set((await db.collection("conflicts").find({},{projection:{_id:1}}).toArray()).map(t=>t._id.toString()));
  const orgIds = new Set((await db.collection("organizations").find({},{projection:{_id:1}}).toArray()).map(t=>t._id.toString()));
  
  const publishedBlogs = await db.collection("blogs").find({status:"published"},{
    projection:{_id:1,slug:1,topics:1,countries:1,leaders:1,conflicts:1,organizations:1}
  }).toArray();
  
  let brokenRefs = 0;
  for (const b of publishedBlogs) {
    for (const t of (b.topics||[])) { if (!topicIds.has(t.toString())) { console.log("BROKEN topic ref:", b.slug, t); brokenRefs++; } }
    for (const c of (b.countries||[])) { if (!countryIds.has(c.toString())) { console.log("BROKEN country ref:", b.slug, c); brokenRefs++; } }
    for (const l of (b.leaders||[])) { if (!leaderIds.has(l.toString())) { console.log("BROKEN leader ref:", b.slug, l); brokenRefs++; } }
    for (const cf of (b.conflicts||[])) { if (!conflictIds.has(cf.toString())) { console.log("BROKEN conflict ref:", b.slug, cf); brokenRefs++; } }
    for (const o of (b.organizations||[])) { if (!orgIds.has(o.toString())) { console.log("BROKEN org ref:", b.slug, o); brokenRefs++; } }
  }
  console.log("Broken ObjectId refs:", brokenRefs);
  
  // Count changes made
  const conflictedBlogs = publishedBlogs.filter(b => (b.conflicts||[]).length > 0).length;
  const withEntities = publishedBlogs.filter(b => {
    return (b.topics||[]).length>0 || (b.countries||[]).length>0 || (b.leaders||[]).length>0 || 
           (b.conflicts||[]).length>0 || (b.organizations||[]).length>0;
  }).length;
  
  const result = {
    integrityOk: allMatch && brokenRefs === 0,
    totalBlogs: totalAll,
    publishedBlogs: totalPub,
    archivedBlogs: totalArchived,
    draftBlogs: totalDraft,
    checksums: { pre: PRE_CHECKSUMS, post: postChecksums, match: allMatch },
    brokenObjectIdRefs: brokenRefs,
    orphansRemaining: orphans.length,
    articlesWithEntities: withEntities,
    articlesWithConflicts: conflictedBlogs
  };
  
  fs.writeFileSync("/tmp/phase4a_integrity_result.json", JSON.stringify(result, null, 2));
  console.log("\n=== INTEGRITY RESULT ===");
  console.log("INTEGRITY OK:", result.integrityOk);
  console.log("Published:", totalPub, "Archived:", totalArchived);
  console.log("Articles with any entity:", withEntities, "/", totalPub);
  console.log("Articles with conflict links:", conflictedBlogs, "/", totalPub);
  
  await mongoose.connection.close();
}
run().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
