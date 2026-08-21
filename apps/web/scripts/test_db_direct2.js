require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
// no need to require ts, just query the raw DB directly to prove DB works
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB directly.");
  
  try {
      const db = mongoose.connection.db;
      const blog = await db.collection("blogs").findOne({ slug: "india-growth-defence-geopolitics-before-after-2014" });
      console.log("Direct DB retrieval:", blog ? "Success" : "Failed");
      console.log("Category ID:", blog.categoryId);
      console.log("Conflicts:", blog.conflicts);
  } catch(e) {
      console.error("Direct DB Error:", e);
  }
  
  await mongoose.connection.close();
}
run().catch(console.error);
