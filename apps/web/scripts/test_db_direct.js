require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const { Blog } = require("./src/lib/models/Blog.ts"); // wait, ts file in node won't work natively unless compiled or ts-node

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB directly.");
  
  try {
      // Just test a direct mongoose query using the same populate chain, 
      // but we need to register models first.
      
      const Topic = mongoose.models.Topic || mongoose.model("Topic", new mongoose.Schema({}));
      const Country = mongoose.models.Country || mongoose.model("Country", new mongoose.Schema({}));
      const Region = mongoose.models.Region || mongoose.model("Region", new mongoose.Schema({}));
      const Leader = mongoose.models.Leader || mongoose.model("Leader", new mongoose.Schema({}));
      const Conflict = mongoose.models.Conflict || mongoose.model("Conflict", new mongoose.Schema({}));
      const Organization = mongoose.models.Organization || mongoose.model("Organization", new mongoose.Schema({}));
      const Category = mongoose.models.Category || mongoose.model("Category", new mongoose.Schema({}));
      
      // We will just do a lean query without TS models to test direct DB access
      const db = mongoose.connection.db;
      const blog = await db.collection("blogs").findOne({ slug: "india-growth-defence-geopolitics-before-after-2014" });
      console.log("Direct DB retrieval:", blog ? "Success" : "Failed");
  } catch(e) {
      console.error("Direct DB Error:", e);
  }
  
  await mongoose.connection.close();
}
run().catch(console.error);
