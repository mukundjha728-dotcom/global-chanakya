const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function runBackup() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");

  const url = new URL(process.env.MONGODB_URI);
  const dbName = url.pathname.slice(1);
  const host = url.hostname;

  console.log(`Database Name: ${dbName}`);
  console.log(`Host: ${host}`);

  await mongoose.connect(process.env.MONGODB_URI);

  const blogSchema = new mongoose.Schema({}, { strict: false });
  const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema, 'blogs');

  const blogs = await Blog.find({}, { _id: 1, title: 1, slug: 1, category: 1, tags: 1, categoryId: 1, topics: 1, countries: 1, regions: 1, leaders: 1, conflicts: 1, organizations: 1 }).lean();

  const backupDir = path.resolve(__dirname, '../../scratch');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  
  const backupFile = path.join(backupDir, `blog_backup_${Date.now()}.jsonl`);

  let checksumData = "";
  
  const writeStream = fs.createWriteStream(backupFile);
  blogs.forEach(b => {
    writeStream.write(JSON.stringify(b) + '\n');
    const checksumStr = `${b._id.toString()}|${b.category || ""}|${(b.tags || []).join(",")}`;
    checksumData += checksumStr + "\n";
  });
  writeStream.end();

  const hash = crypto.createHash('sha256').update(checksumData).digest('hex');

  const collections = ['categories', 'topics', 'countries', 'regions', 'leaders', 'conflicts', 'organizations'];
  const entityCounts = {};
  for (const c of collections) {
    try {
      const col = mongoose.connection.collection(c);
      entityCounts[c] = await col.countDocuments();
    } catch(e) {
      entityCounts[c] = 0;
    }
  }

  const report = `# PRE-MIGRATION BACKUP REPORT

- **Timestamp:** ${new Date().toISOString()}
- **Database Name:** ${dbName}
- **Cluster/Host:** ${host}
- **Blog Count:** ${blogs.length}
- **Entity Collection Counts:**
${Object.entries(entityCounts).map(([k,v]) => `  - ${k}: ${v}`).join('\n')}
- **Backup Location:** ${backupFile}
- **Backup Record Count:** ${blogs.length}
- **Legacy Field Checksum (SHA-256):** ${hash}
`;

  fs.writeFileSync('c:/Users/mukun/Downloads/global-chanakya-1/apps/web/seo_phase2_pre_migration_backup_report.md', report);
  console.log(report);
  console.log("BACKUP SUCCESS");
  
  await mongoose.disconnect();
}

runBackup().catch(console.error);
