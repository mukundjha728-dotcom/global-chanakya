const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const BlogSchema = new mongoose.Schema({}, { strict: false, collection: 'blogs' });
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

async function snapshot() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find legacy override
  const legacyTarget = await Blog.findOne({ "seo.canonicalUrl": { $regex: "/reports/" } }).lean();
  
  // Find whitespace slugs
  const wsTargets = await Blog.find({ slug: /^\s/ }).lean();
  
  const allTargets = [];
  if (legacyTarget) allTargets.push(legacyTarget);
  allTargets.push(...wsTargets);
  
  console.log(`FOUND ${allTargets.length} TARGETS FOR CANONICAL MUTATION`);
  console.log("=========================================");
  for (const doc of allTargets) {
    console.log(JSON.stringify({
      _id: doc._id,
      slug: doc.slug,
      title: doc.title,
      "seo.canonicalUrl": doc.seo?.canonicalUrl,
      status: doc.status,
      updatedAt: doc.updatedAt
    }, null, 2));
  }
  
  process.exit(0);
}

snapshot().catch(console.error);
