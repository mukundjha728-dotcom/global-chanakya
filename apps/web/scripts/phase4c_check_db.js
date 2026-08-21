const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const BlogSchema = new mongoose.Schema({}, { strict: false, collection: 'blogs' });
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

async function checkDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const blog = await Blog.findOne({ slug: "the-third-pole-india-s-bid-to-shape-the-emerging-multipolar-world-order" }).lean();
  console.log("Canonical in DB:", blog.seo?.canonicalUrl);
  
  // also check one with whitespace
  const wsBlog = await Blog.findOne({ slug: " recep-tayyip-erdogan-strategic-role-2026" }).lean();
  console.log("Whitespace slug in DB:", wsBlog.slug);
  console.log("Canonical in DB:", wsBlog.seo?.canonicalUrl);
  
  process.exit(0);
}
checkDb().catch(console.error);
