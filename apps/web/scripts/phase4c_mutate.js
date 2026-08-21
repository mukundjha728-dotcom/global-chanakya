const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

const BlogSchema = new mongoose.Schema({}, { strict: false, collection: 'blogs' });
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

function getChecksum(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

async function verifyAndMutate() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // 1. Fetch pre-mutation checksums
  const allBlogs = await Blog.find({ status: "published" }).sort({ _id: 1 }).lean();
  const categoryData = allBlogs.map(b => b.category);
  const tagsData = allBlogs.map(b => b.tags);
  const titleData = allBlogs.map(b => b.title);
  const slugDataPre = allBlogs.map(b => b.slug);
  
  const categoryHash = getChecksum(categoryData);
  const tagsHash = getChecksum(tagsData);
  const titleHash = getChecksum(titleData);
  const slugHashPre = getChecksum(slugDataPre);

  console.log("PRE-MUTATION CHECKSUMS:");
  console.log("category:", categoryHash);
  console.log("tags:", tagsHash);
  console.log("title:", titleHash);
  console.log("slug:", slugHashPre);

  // 2. Validate Legacy Canonical
  const legacySlug = "the-third-pole-india-s-bid-to-shape-the-emerging-multipolar-world-order";
  const legacyDoc = await Blog.findOne({ slug: legacySlug }).lean();
  
  if (!legacyDoc || legacyDoc.status !== "published" || legacyDoc.seo?.canonicalUrl !== "https://www.globalchanakya.in/reports/the-third-pole-india-s-bid-to-shape-the-emerging-multipolar-world-order") {
    console.error("Validation failed for legacy doc");
    process.exit(1);
  }
  
  // 3. Validate 6 whitespace slugs
  const wsSlugs = [
    " australia-strategic-role-against-china-2026",
    " india-china-border-tensions-future-risks-2026",
    " japan-military-expansion-regional-security-2026",
    " nato-future-unstable-europe-2026",
    " recep-tayyip-erdogan-strategic-role-2026",
    " taiwan-crisis-strategic-scenarios-explained-2026"
  ];
  
  const wsDocs = await Blog.find({ slug: { $in: wsSlugs } }).lean();
  if (wsDocs.length !== 6) {
    console.error(`Validation failed: found ${wsDocs.length} whitespace docs instead of 6`);
    process.exit(1);
  }
  
  for (const doc of wsDocs) {
    if (doc.status !== "published") {
      console.error(`Validation failed: ${doc.slug} is not published`);
      process.exit(1);
    }
    const cleanSlug = doc.slug.trim();
    if (doc.slug.length - cleanSlug.length !== 1 || doc.slug[0] !== ' ') {
       console.error(`Validation failed: ${doc.slug} does not have exactly one leading space`);
       process.exit(1);
    }
    const existingClean = await Blog.findOne({ slug: cleanSlug }).lean();
    if (existingClean) {
       console.error(`Validation failed: clean slug ${cleanSlug} already exists`);
       process.exit(1);
    }
  }
  
  console.log("ALL VALIDATIONS PASSED. EXECUTING MUTATIONS...");
  
  // 4. Mutate
  await Blog.updateOne(
    { _id: legacyDoc._id },
    { $unset: { "seo.canonicalUrl": "" } }
  );
  
  const mappings = [];
  for (const doc of wsDocs) {
    const cleanSlug = doc.slug.trim();
    mappings.push(`OLD: "${doc.slug}" -> NEW: "${cleanSlug}"`);
    await Blog.updateOne(
      { _id: doc._id },
      { $set: { slug: cleanSlug } }
    );
  }
  
  // 5. Verify post-mutation
  const postLegacy = await Blog.findOne({ _id: legacyDoc._id }).lean();
  console.log(`Legacy post-mutation seo.canonicalUrl: ${postLegacy.seo?.canonicalUrl}`);
  
  const postWs = await Blog.find({ _id: { $in: wsDocs.map(d => d._id) } }).lean();
  postWs.forEach(d => console.log(`Whitespace post-mutation slug: "${d.slug}"`));
  
  // 6. Post-mutation checksums
  const postBlogs = await Blog.find({ status: "published" }).sort({ _id: 1 }).lean();
  const categoryHashPost = getChecksum(postBlogs.map(b => b.category));
  const tagsHashPost = getChecksum(postBlogs.map(b => b.tags));
  const titleHashPost = getChecksum(postBlogs.map(b => b.title));
  const slugHashPost = getChecksum(postBlogs.map(b => b.slug));
  
  console.log("\POST-MUTATION CHECKSUMS:");
  console.log("category match:", categoryHash === categoryHashPost);
  console.log("tags match:", tagsHash === tagsHashPost);
  console.log("title match:", titleHash === titleHashPost);
  console.log("slug:", slugHashPost);
  
  console.log("\nSLUG MAPPINGS:");
  mappings.forEach(m => console.log(m));
  
  process.exit(0);
}

verifyAndMutate().catch(console.error);
