require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const crypto = require("crypto");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const PRE_CHECKSUMS = {
    category: "058cbc5d0e8a0924ae1fb16e9c0e15157437a71dcfa24cf294b58ca4f575322b",
    tags: "2590edbce93e5af8507183076df055794f94c748364f101549c58324fc15b92f",
    slug: "ec63ec3ca98e239c3286323032aa442e530f918faf1f28371f0bf1ca2aff0fee",
    title: "86b07cd13f007565df7642c57ded82c3899249ce454df0ded4555136bc811b56"
  };

  const blogs = await db.collection("blogs").find({},{
    projection:{_id:1,slug:1,title:1,category:1,tags:1,status:1,conflicts:1,topics:1,countries:1,leaders:1,organizations:1}
  }).toArray();
  
  const total = blogs.length;
  const published = blogs.filter(b=>b.status==="published").length;
  const archived = blogs.filter(b=>b.status==="archived").length;
  
  const pubarch = blogs.filter(b=>["published","archived"].includes(b.status));
  const categoryStr = pubarch.map(b=>b.category||"").sort().join("|");
  const tagsStr = pubarch.map(b=>(b.tags||[]).sort().join(",")).sort().join("|");
  const slugStr = pubarch.map(b=>b.slug||"").sort().join("|");
  const titleStr = pubarch.map(b=>b.title||"").sort().join("|");

  const postChecksums = {
    category: crypto.createHash("sha256").update(categoryStr).digest("hex"),
    tags: crypto.createHash("sha256").update(tagsStr).digest("hex"),
    slug: crypto.createHash("sha256").update(slugStr).digest("hex"),
    title: crypto.createHash("sha256").update(titleStr).digest("hex"),
  };

  let allMatch = true;
  for (const field of ["category","tags","slug","title"]) {
    if (PRE_CHECKSUMS[field] !== postChecksums[field]) {
       allMatch = false;
       console.log(`Mismatch on ${field}`);
    }
  }

  // Broken ObjectIds / duplicates
  let brokenIds = 0;
  let duplicateIds = 0;
  const topicIds = new Set((await db.collection("topics").find({},{projection:{_id:1}}).toArray()).map(t=>t._id.toString()));
  const countryIds = new Set((await db.collection("countries").find({},{projection:{_id:1}}).toArray()).map(t=>t._id.toString()));
  const leaderIds = new Set((await db.collection("leaders").find({},{projection:{_id:1}}).toArray()).map(t=>t._id.toString()));
  const conflictIds = new Set((await db.collection("conflicts").find({},{projection:{_id:1}}).toArray()).map(t=>t._id.toString()));
  const orgIds = new Set((await db.collection("organizations").find({},{projection:{_id:1}}).toArray()).map(t=>t._id.toString()));
  
  for (const b of blogs) {
     const checkRefs = (arr, idSet) => {
         if (!arr) return;
         const seen = new Set();
         for (const id of arr) {
            const sid = id.toString();
            if (!idSet.has(sid)) brokenIds++;
            if (seen.has(sid)) duplicateIds++;
            seen.add(sid);
         }
     };
     checkRefs(b.topics, topicIds);
     checkRefs(b.countries, countryIds);
     checkRefs(b.leaders, leaderIds);
     checkRefs(b.conflicts, conflictIds);
     checkRefs(b.organizations, orgIds);
  }

  // Verify 18 HIGH conflicts exist and 11 MEDIUM/REMOVED do not exist
  const CF = {}; 
  (await db.collection("conflicts").find({},{projection:{_id:1,name:1}}).toArray()).forEach(e => CF[e.name] = e._id.toString());
  
  const highList = [
    {slug:"hormuz-black-sea-chokepoints-iran-ukraine-oil-food-weaponization", c:"Ukraine War"},
    {slug:"leipzig-drone-attack-germany-russia-intelligence-trail", c:"Ukraine War"},
    {slug:"yemen-ukraine-convergence-drone-war-distant-fronts-2026", c:"Ukraine War"},
    {slug:"russia-ukraine-war-next-phase-frozen-conflict-escalation-analysis", c:"Ukraine War"},
    {slug:"red-sea-crisis-world-trade-geopolitics-houthi-shipping", c:"Yemen Civil War"},
    {slug:"israel-iron-dome-defence-system-explained", c:"Gaza"},
    {slug:"zelensky-vs-putin-leadership-comparison-2026", c:"Ukraine War"},
    {slug:"ali-khamenei-israel-strategic-outlook-iran-war", c:"Gaza"},
    {slug:"volodymyr-zelensky-war-leadership-analysis-2026", c:"Ukraine War"},
    {slug:"vladimir-putin-war-doctrine-explained-2026", c:"Ukraine War"},
    {slug:"ukraine-nato-membership-risks-2026", c:"Ukraine War"},
    {slug:"myanmar-civil-war-strategic-breakdown-2026", c:"Myanmar Crisis"},
    {slug:"red-sea-crisis-global-trade-impact-2026", c:"Yemen Civil War"},
    {slug:"yemen-civil-war-strategic-importance-2026", c:"Yemen Civil War"},
    {slug:"iran-israel-proxy-war-explained-2026", c:"Gaza"},
    {slug:"iran-israel-proxy-war-explained-2026", c:"Yemen Civil War"},
    {slug:"russia-ukraine-war-timeline-strategic-analysis-2026", c:"Ukraine War"},
    {slug:"trump-diplomacy-ukraine-ceasefire-beijing-summit-iran-2026", c:"Ukraine War"}
  ];
  const pullList = [
    {slug:"proxy-warfare-cheapest-way-fight-global-wars-iran-russia-china", c:"Ukraine War"},
    {slug:"proxy-warfare-cheapest-way-fight-global-wars-iran-russia-china", c:"Yemen Civil War"},
    {slug:"strategic-risk-simultaneous-multi-theatre-wars-analysis", c:"Ukraine War"},
    {slug:"global-food-security-risks-war-geopolitical-analysis", c:"Ukraine War"},
    {slug:"global-supply-chain-risks-2026-geopolitics-trade-disruption", c:"Ukraine War"},
    {slug:"red-sea-crisis-world-trade-geopolitics-houthi-shipping", c:"Ukraine War"},
    {slug:" recep-tayyip-erdogan-strategic-role-2026", c:"Ukraine War"},
    {slug:"olaf-scholz-germany-military-repositioning-zeitenwende", c:"Ukraine War"},
    {slug:"donald-trump-foreign-policy-predictions-2026", c:"Ukraine War"},
    {slug:"united-states-strategic-intelligence-report-2026", c:"Ukraine War"},
    {slug:"red-sea-crisis-global-trade-impact-2026", c:"Gaza"}
  ];
  
  let highMissing = 0;
  for (const h of highList) {
     const b = blogs.find(x=>x.slug===h.slug);
     if (!b || !(b.conflicts||[]).map(x=>x.toString()).includes(CF[h.c])) {
         highMissing++;
         console.log("Missing HIGH:", h.slug, h.c);
     }
  }
  let medPresent = 0;
  for (const p of pullList) {
     const b = blogs.find(x=>x.slug===p.slug);
     if (b && (b.conflicts||[]).map(x=>x.toString()).includes(CF[p.c])) {
         medPresent++;
         console.log("Present MED/LOW:", p.slug, p.c);
     }
  }
  
  console.log(`\nValidation complete:`);
  console.log(`Blogs: ${total} total, ${published} pub, ${archived} arch`);
  console.log(`Checksums: ${allMatch ? "MATCH" : "MISMATCH"}`);
  console.log(`Broken Ids: ${brokenIds}, Duplicates: ${duplicateIds}`);
  console.log(`HIGH conflicts verified: ${highMissing===0 ? "YES" : "NO (Missing "+highMissing+")"}`);
  console.log(`MED/LOW removed: ${medPresent===0 ? "YES" : "NO (Present "+medPresent+")"}`);

  await mongoose.connection.close();
}
run().catch(console.error);
