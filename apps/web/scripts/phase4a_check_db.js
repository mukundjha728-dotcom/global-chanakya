require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const crypto = require("crypto");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const blogs166 = await db.collection("blogs").find(
    {status:{$in:["published","archived"]}},
    {projection:{_id:1,slug:1,title:1,category:1,tags:1,status:1,conflicts:1}}
  ).toArray();

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
  
  console.log("Checksums:");
  console.log("category:", post166.category);
  console.log("tags:", post166.tags);
  console.log("slug:", post166.slug);
  console.log("title:", post166.title);

  const conflictsLinked = blogs166.reduce((acc, b) => acc + (b.conflicts||[]).length, 0);
  console.log("Total conflict links in DB:", conflictsLinked);

  await mongoose.connection.close();
}
run().catch(console.error);
