require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const all = await db.collection("blogs").find({status:"published"},{projection:{_id:1,slug:1,"seo.title":1,title:1}}).toArray();
  const longSeoTitle = all.filter(b => b.seo && b.seo.title && b.seo.title.length > 70).sort((a,b)=>b.seo.title.length-a.seo.title.length);
  console.log("seo.title > 70 chars:", longSeoTitle.length);
  longSeoTitle.slice(0,20).forEach(b => console.log(b.seo.title.length + "ch: " + b.seo.title));
  await mongoose.connection.close();
}
run().catch(console.error);
