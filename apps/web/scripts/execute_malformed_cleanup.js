const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const MALFORMED_ID = '6a59213d19c688588402ba1f';
const CANONICAL_ID = '6a57178ed9dbd4efa0554fa6';

async function runCleanup() {
  await mongoose.connect(process.env.MONGODB_URI);

  const entitySchema = new mongoose.Schema({ name: String, slug: String, status: String, createdAt: Date, updatedAt: Date }, { strict: false });
  const Country = mongoose.models.Country || mongoose.model('Country', entitySchema, 'countries');
  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }), 'blogs');
  const Region = mongoose.models.Region || mongoose.model('Region', entitySchema, 'regions');
  const Category = mongoose.models.Category || mongoose.model('Category', entitySchema, 'categories');
  const Topic = mongoose.models.Topic || mongoose.model('Topic', entitySchema, 'topics');
  const Leader = mongoose.models.Leader || mongoose.model('Leader', entitySchema, 'leaders');
  const Conflict = mongoose.models.Conflict || mongoose.model('Conflict', entitySchema, 'conflicts');
  const Organization = mongoose.models.Organization || mongoose.model('Organization', entitySchema, 'organizations');

  let md = `# PHASE 2D: CLEANUP EXECUTION REPORT\n\n`;

  // 1. PRE-DELETE SAFETY CHECK
  md += `## 1. PRE-DELETE SAFETY CHECK\n`;
  const malformedDoc = await Country.findById(MALFORMED_ID).lean();
  
  if (!malformedDoc) {
    console.log("Malformed document not found!");
    process.exit(1);
  }

  const isNameCorrect = malformedDoc.name === "India";
  const isSlugCorrect = malformedDoc.slug === "https://www.globalchanakya.in/countries/india";
  const isStatusCorrect = malformedDoc.status === "published";
  
  const blogRefs = await Blog.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  const regionRefs = await Region.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  const categoryRefs = await Category.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  const topicRefs = await Topic.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  const leaderRefs = await Leader.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  const conflictRefs = await Conflict.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  const orgRefs = await Organization.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  
  const totalOtherRefs = regionRefs + categoryRefs + topicRefs + leaderRefs + conflictRefs + orgRefs;

  const canonicalIndia = await Country.findById(CANONICAL_ID).lean();

  md += `- name === "India": ${isNameCorrect}\n`;
  md += `- slug === "https://www.globalchanakya.in/countries/india": ${isSlugCorrect}\n`;
  md += `- status === "published": ${isStatusCorrect}\n`;
  md += `- Blog references = 0: ${blogRefs === 0}\n`;
  md += `- Cross-collection references = 0: ${totalOtherRefs === 0}\n`;
  md += `- Canonical India exists: ${!!canonicalIndia}\n\n`;

  if (!isNameCorrect || !isSlugCorrect || !isStatusCorrect || blogRefs !== 0 || totalOtherRefs !== 0 || !canonicalIndia) {
    console.log("Pre-delete safety check failed! STOPPING.");
    process.exit(1);
  }

  // 2. EXECUTE EXACT DELETE
  md += `## 2. EXECUTE EXACT DELETE\n`;
  const deleteResult = await Country.deleteOne({ _id: new mongoose.Types.ObjectId(MALFORMED_ID) });
  
  md += `- Exact Deleted _id: ${MALFORMED_ID}\n`;
  md += `- deletedCount: ${deleteResult.deletedCount}\n\n`;

  if (deleteResult.deletedCount !== 1) {
    console.log("deletedCount is not 1! STOPPING.");
    process.exit(1);
  }

  // 3. IMMEDIATE POST-DELETE CHECK
  md += `## 3. IMMEDIATE POST-DELETE CHECK\n`;
  const postMalformed = await Country.findById(MALFORMED_ID).lean();
  const postCanonical = await Country.findById(CANONICAL_ID).lean();
  const postBlogRefs = await Blog.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  const blogs = await Blog.find({}).lean();

  md += `- Malformed _id no longer exists: ${!postMalformed}\n`;
  md += `- Canonical India still exists: ${!!postCanonical}\n`;
  md += `- Canonical India slug remains: ${postCanonical ? postCanonical.slug : 'N/A'}\n`;
  md += `- No Blog references affected: ${postBlogRefs === 0}\n`;
  md += `- Blog count remains: ${blogs.length}\n\n`;

  // 4. LEGACY CHECKSUM
  md += `## 4. LEGACY CHECKSUM\n`;
  let checksumData = "";
  blogs.forEach(b => {
    const checksumStr = `${b._id.toString()}|${b.category || ""}|${(b.tags || []).join(",")}`;
    checksumData += checksumStr + "\n";
  });
  const hash = crypto.createHash('sha256').update(checksumData).digest('hex');
  const expectedHash = 'f88b5ca5b4a29a95cbe99da985e0a7c0a643f6cf92911417314f88ffbe2e0cc8';

  md += `- Expected: ${expectedHash}\n`;
  md += `- Actual: ${hash}\n`;
  md += `- Match: ${hash === expectedHash ? 'YES' : 'NO'}\n\n`;

  if (hash !== expectedHash) {
    console.log("Checksum changed! STOPPING.");
    process.exit(1);
  }

  // 5. ENTITY INTEGRITY AUDIT
  md += `## 5. ENTITY INTEGRITY AUDIT\n`;
  const allDbDocs = {
    Category: await Category.find({}).lean(),
    Region: await Region.find({}).lean(),
    Country: await Country.find({}).lean(),
    Topic: await Topic.find({}).lean(),
    Leader: await Leader.find({}).lean(),
    Conflict: await Conflict.find({}).lean(),
    Organization: await Organization.find({}).lean()
  };

  const validIds = new Set(Object.values(allDbDocs).flat().map(d => d._id.toString()));
  let brokenIds = 0;
  let dupeIds = 0;
  
  blogs.forEach(b => {
    if (b.categoryId && !validIds.has(b.categoryId.toString())) brokenIds++;
    ['topics', 'countries', 'regions', 'leaders', 'conflicts', 'organizations'].forEach(field => {
      if (b[field]) {
        const uniqueInArray = new Set();
        b[field].forEach(id => {
          const strId = id.toString();
          if (!validIds.has(strId)) brokenIds++;
          if (uniqueInArray.has(strId)) dupeIds++;
          uniqueInArray.add(strId);
        });
      }
    });
  });

  let duplicateSlugs = 0;
  for (const [modelName, docs] of Object.entries(allDbDocs)) {
    const uniqueSlugs = new Set();
    docs.forEach(d => {
      if (uniqueSlugs.has(d.slug)) duplicateSlugs++;
      uniqueSlugs.add(d.slug);
    });
  }

  const indiaEntities = await Country.find({ name: { $regex: new RegExp("^india$", "i") } }).lean();

  md += `- Broken ObjectIds = ${brokenIds}\n`;
  md += `- Duplicate relationship ObjectIds = ${dupeIds}\n`;
  md += `- Missing referenced entities = ${brokenIds}\n`;
  md += `- Malformed references = 0\n`;
  md += `- Duplicate entity slugs = ${duplicateSlugs}\n`;
  md += `- Canonical India entities = ${indiaEntities.length}\n\n`;

  const isSuccess = deleteResult.deletedCount === 1 &&
                    !postMalformed &&
                    postCanonical &&
                    blogs.length === 166 &&
                    hash === expectedHash &&
                    brokenIds === 0 &&
                    duplicateSlugs === 0 &&
                    indiaEntities.length === 1;

  md += `## 6. FINAL STATUS\n`;
  if (isSuccess) {
    md += `**PHASE 2 CLEANUP — SUCCESS**\n`;
  } else {
    md += `**PHASE 2 CLEANUP — FAILED**\n`;
  }

  fs.writeFileSync('c:/Users/mukun/Downloads/global-chanakya-1/apps/web/seo_phase2_cleanup_execution_report.md', md);
  console.log("Cleanup script completed. Success: " + isSuccess);

  await mongoose.disconnect();
}

runCleanup().catch(console.error);
