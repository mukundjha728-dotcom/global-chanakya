require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const fs = require("fs");
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  // Investigate duplicate
  const dupes = await db.collection("blogs").find({title:"Top 10 Strongest Militaries in the World 2026"},{
    projection:{_id:1,slug:1,title:1,publishAt:1,updatedAt:1,status:1,"analytics.views":1,
      "seo.title":1,"seo.description":1,topics:1,countries:1,leaders:1,conflicts:1,organizations:1,
      category:1,tags:1}
  }).toArray();
  console.log("Duplicate articles count:", dupes.length);
  dupes.forEach((b,i) => {
    console.log("---", i+1, "---");
    console.log("_id:", b._id.toString());
    console.log("slug:", b.slug);
    console.log("status:", b.status);
    console.log("publishAt:", b.publishAt);
    console.log("updatedAt:", b.updatedAt);
    console.log("views:", b.analytics && b.analytics.views);
    console.log("topics:", (b.topics||[]).length, "countries:", (b.countries||[]).length, "leaders:", (b.leaders||[]).length);
    console.log("conflicts:", (b.conflicts||[]).length, "orgs:", (b.organizations||[]).length);
    console.log("tags:", b.tags);
    console.log("seoTitle:", b.seo && b.seo.title);
    console.log("seoDesc:", b.seo && b.seo.description);
  });
  
  // Get orphan articles - no topics AND no countries AND no leaders AND no conflicts AND no orgs
  const all = await db.collection("blogs").find({status:"published"},{
    projection:{_id:1,slug:1,title:1,tags:1,category:1,"seo.keywords":1,topics:1,countries:1,leaders:1,conflicts:1,organizations:1}
  }).toArray();
  
  const orphans = all.filter(b => {
    const t = (b.topics||[]).length;
    const c = (b.countries||[]).length;
    const l = (b.leaders||[]).length;
    const cf = (b.conflicts||[]).length;
    const o = (b.organizations||[]).length;
    return t===0 && c===0 && l===0 && cf===0 && o===0;
  });
  
  console.log("\n=== ORPHAN ARTICLES ===");
  console.log("Count:", orphans.length);
  const orphanData = orphans.map((b,i) => ({
    i: i+1,
    id: b._id.toString(),
    slug: b.slug,
    title: b.title,
    tags: b.tags,
    category: b.category,
    keywords: b.seo && b.seo.keywords
  }));
  fs.writeFileSync("/tmp/phase4a_orphans.json", JSON.stringify(orphanData, null, 2));
  orphans.forEach((b,i) => console.log(i+1, b.slug));
  
  await mongoose.connection.close();
}
run().catch(console.error);
