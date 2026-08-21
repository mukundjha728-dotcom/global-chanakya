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
  
  // IMPORTANT: pre-checksums were on status:"published" which had 166 docs
  // Now pub=165, arch=1. Need to check ALL 166 (pub+arch) to compare to original 166
  const blogs166 = await db.collection("blogs").find(
    {status:{$in:["published","archived"]}},
    {projection:{_id:1,slug:1,title:1,category:1,tags:1,status:1}}
  ).toArray();
  
  console.log("Total pub+arch:", blogs166.length);
  
  const categoryStr = blogs166.map(b=>b.category||"").sort().join("|");
  const tagsStr = blogs166.map(b=>(b.tags||[]).sort().join(",")).sort().join("|");
  const slugStr = blogs166.map(b=>b.slug||"").sort().join("|");
  const titleStr = blogs166.map(b=>b.title||"").sort().join("|");
  
  const post166 = {
    category: crypto.createHash("sha256").update(categoryStr).digest("hex"),
    tags: crypto.createHash("sha256").update(tagsStr).digest("hex"),
    slug: crypto.createHash("sha256").update(slugStr).digest("hex"),
    title: crypto.createHash("sha256").update(titleStr).digest("hex"),
  };
  
  console.log("\n=== CHECKSUM VERIFICATION (all 166 pub+arch) ===");
  let allMatch = true;
  for (const field of ["category","tags","slug","title"]) {
    const match = PRE_CHECKSUMS[field] === post166[field];
    console.log(field, match ? "MATCH" : "MISMATCH");
    if (!match) allMatch = false;
  }
  console.log("All match:", allMatch);
  
  // Also verify duplicate archived article legacy fields unchanged
  const dupArt = await db.collection("blogs").findOne(
    {_id: new mongoose.Types.ObjectId("6a38d688f428bcdca3d2919b")},
    {projection:{_id:1,slug:1,title:1,category:1,tags:1,status:1}}
  );
  console.log("\nDuplicate article check:");
  console.log("  slug:", dupArt.slug);
  console.log("  title:", dupArt.title);
  console.log("  category:", dupArt.category);
  console.log("  status:", dupArt.status, "(ONLY this field changed)");
  console.log("  tags count:", dupArt.tags.length);
  
  await mongoose.connection.close();
}
run().catch(e => { console.error("FATAL:", e); process.exit(1); });
