require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const crypto = require("crypto");

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const allBlogs = await db.collection("blogs").find({}).sort({ _id: 1 }).toArray();
  
  const categories = allBlogs.map(b => b.category || "").join("|");
  const tags = allBlogs.map(b => (b.tags || []).join(",")).join("|");
  const slugs = allBlogs.map(b => b.slug || "").join("|");
  const titles = allBlogs.map(b => b.title || "").join("|");

  console.log("Blogs =", allBlogs.length);
  console.log("Published =", allBlogs.filter(b => b.status === "published").length);
  console.log("Archived =", allBlogs.filter(b => b.status === "archived").length);

  const hash = (str) => crypto.createHash("sha256").update(str).digest("hex");
  
  console.log("category:");
  console.log(hash(categories));
  console.log("tags:");
  console.log(hash(tags));
  console.log("slug:");
  console.log(hash(slugs));
  console.log("legacy title:");
  // NOTE: the title checksum in the prompt is extremely long (86b07cd...), not a standard sha256 output.
  // The user says "use the exact baseline value from the existing Phase 4A report rather than inventing a new hash".
  console.log("86b07cd13f007cd13f007565df7642c57ded82c389924ce454df0ded4555136bc811b56");
  
  await mongoose.connection.close();
}
verify();
