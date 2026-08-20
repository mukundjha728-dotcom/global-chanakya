const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const MALFORMED_ID = '6a59213d19c688588402ba1f';
const CANONICAL_SLUG = 'india';

async function runCleanupDryRun() {
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

  let report = `# PHASE 2D: MALFORMED COUNTRY ENTITY CLEANUP REPORT\n\n`;

  report += `## 1. VERIFY MALFORMED DOCUMENT\n`;
  const malformedDoc = await Country.findById(MALFORMED_ID).lean();
  if (!malformedDoc) {
    console.log("Malformed document not found!");
    process.exit(1);
  }

  report += `- _id: ${malformedDoc._id}\n`;
  report += `- name: ${malformedDoc.name}\n`;
  report += `- slug: ${malformedDoc.slug}\n`;
  report += `- status: ${malformedDoc.status || 'undefined'}\n`;
  report += `- description: ${malformedDoc.description || 'undefined'}\n`;
  report += `- seo fields: ${JSON.stringify(malformedDoc.seo || 'undefined')}\n`;
  report += `- region references: ${JSON.stringify(malformedDoc.regions || 'undefined')}\n`;
  report += `- createdAt: ${malformedDoc.createdAt}\n`;
  report += `- updatedAt: ${malformedDoc.updatedAt}\n`;
  report += `- other fields: ${JSON.stringify(Object.keys(malformedDoc).filter(k => !['_id', 'name', 'slug', 'status', 'description', 'seo', 'regions', 'createdAt', 'updatedAt'].includes(k)))}\n\n`;

  const canonicalIndia = await Country.findOne({ slug: CANONICAL_SLUG }).lean();

  report += `## 2. CHECK CROSS-COLLECTION REFERENCES\n`;
  
  // Blog references
  const blogRefs = await Blog.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  
  // Other references (check all other taxonomy models just in case)
  const regionRefs = await Region.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  const categoryRefs = await Category.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  const topicRefs = await Topic.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  const leaderRefs = await Leader.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  const conflictRefs = await Conflict.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });
  const orgRefs = await Organization.countDocuments({ countries: new mongoose.Types.ObjectId(MALFORMED_ID) });

  const totalOtherRefs = regionRefs + categoryRefs + topicRefs + leaderRefs + conflictRefs + orgRefs;

  report += `Expected 0 Blog references. Actual: ${blogRefs}\n`;
  report += `Expected 0 cross-collection references. Actual: ${totalOtherRefs}\n\n`;

  report += `## 3. CHECK WHETHER MALFORMED DOCUMENT WAS CREATED BY PHASE 2\n`;
  const migrationDate = new Date('2026-08-20T00:00:00.000Z'); // Phase 2 started around this date
  const docDate = new Date(malformedDoc.createdAt);
  
  if (docDate < migrationDate) {
    report += `A. Pre-existing legacy data. Document was created on ${docDate.toISOString()}, which is BEFORE the migration date.\n\n`;
  } else {
    report += `B/C. Document was created on ${docDate.toISOString()}, which is AFTER the migration date. Requires further investigation.\n\n`;
  }

  report += `## 4. DRY-RUN OUTPUT\n`;
  
  const isDryRun = process.argv.includes('--dry-run');
  
  let isSafe = false;
  if (malformedDoc.name === 'India' && 
      malformedDoc.slug === 'https://www.globalchanakya.in/countries/india' &&
      blogRefs === 0 && 
      totalOtherRefs === 0 &&
      canonicalIndia && canonicalIndia._id.toString() !== MALFORMED_ID) {
    isSafe = true;
  }

  if (isDryRun) {
    console.log("TARGET FOUND");
    console.log(`TARGET SAFE FOR REMOVAL: ${isSafe ? 'YES' : 'NO'}`);
    console.log(`BLOG REFERENCES: ${blogRefs}`);
    console.log(`OTHER REFERENCES: ${totalOtherRefs}`);
    console.log(`CANONICAL INDIA ENTITY: ${canonicalIndia ? canonicalIndia._id : 'NOT FOUND'}`);
  }

  report += `TARGET SAFE FOR REMOVAL: ${isSafe ? 'YES' : 'NO'}\n`;
  report += `BLOG REFERENCES: ${blogRefs}\n`;
  report += `OTHER REFERENCES: ${totalOtherRefs}\n`;
  report += `CANONICAL INDIA ENTITY: ${canonicalIndia ? canonicalIndia._id : 'NOT FOUND'}\n\n`;

  report += `## 5. ROLLBACK HARDENING STATUS\n`;
  report += `The current rollback script uses a blanket \`$unset\` across all \`categoryId\`, \`topics\`, \`countries\`, \`regions\`, \`leaders\`, \`conflicts\`, and \`organizations\` fields on ALL blogs. This is dangerous because future editors might manually assign these fields, and running the rollback would destroy that data.\n`;
  report += `To harden this safely requires: modifying \`migrate_taxonomy.js\` to record the exact affected Blog IDs and relationships in a new collection (e.g., \`MigrationManifest\`). The rollback script would then strictly read from this manifest to only revert specific relationships on specific blogs. \n`;
  report += `STATUS: Documented as requiring manifest-based architecture. Blanket rollback is untouched for now.\n\n`;

  report += `## 6. FINAL DATABASE INTEGRITY STATUS\n`;
  const blogs = await Blog.find({}).lean();
  let checksumData = "";
  blogs.forEach(b => {
    const checksumStr = `${b._id.toString()}|${b.category || ""}|${(b.tags || []).join(",")}`;
    checksumData += checksumStr + "\n";
  });
  const hash = crypto.createHash('sha256').update(checksumData).digest('hex');
  const expectedHash = 'f88b5ca5b4a29a95cbe99da985e0a7c0a643f6cf92911417314f88ffbe2e0cc8';

  report += `Blogs: ${blogs.length}\n`;
  report += `Legacy Checksum: ${hash}\n`;
  report += `Match Expected: ${hash === expectedHash ? 'YES' : 'NO'}\n`;

  if (isSafe && hash === expectedHash && blogs.length === 166) {
    report += `\nFINAL STATUS: SAFE FOR MANUAL APPROVAL\n`;
  } else {
    report += `\nFINAL STATUS: CLEANUP BLOCKED\n`;
  }

  fs.writeFileSync('c:/Users/mukun/Downloads/global-chanakya-1/apps/web/seo_phase2_malformed_entity_cleanup_report.md', report);

  await mongoose.disconnect();
}

runCleanupDryRun().catch(console.error);
