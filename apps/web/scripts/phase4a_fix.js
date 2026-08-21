require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const article = await db.collection("blogs").findOne({slug: " recep-tayyip-erdogan-strategic-role-2026"});
  if (article) {
     const conflicts = await db.collection("conflicts").find({},{projection:{_id:1,name:1}}).toArray();
     const cid = conflicts.find(c => c.name === "Ukraine War")._id;
     await db.collection("blogs").updateOne({_id: article._id}, {$pull: {conflicts: cid}});
     console.log("Reverted the 11th conflict (slug had leading space)");
  } else {
     console.log("Not found with leading space");
  }
  await mongoose.connection.close();
}
run().catch(console.error);
