import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Cleanup script:
// 1. Remove injected author-schema script tags from all 4 article content fields (app handles this already)
// 2. Remove duplicate H1 from Suez Canal content (component renders H1 from title field)
// 3. Update Suez Canal title field to the shorter version
// 4. Verify all changes

const FIXES = [
  {
    slug: 'serbia-kosovo-tensions-explained-2026',
    removeAuthorSchema: true,
    removeH1: false,
    newTitle: null,
  },
  {
    slug: 'yemen-civil-war-strategic-importance-2026',
    removeAuthorSchema: true,
    removeH1: false,
    newTitle: null,
  },
  {
    slug: 'russia-ukraine-war-timeline-strategic-analysis-2026',
    removeAuthorSchema: true,
    removeH1: false,
    newTitle: null,
  },
  {
    slug: 'suez-canal-2026-strategic-importance-global-trade-egypt',
    removeAuthorSchema: true,
    removeH1: true, // Remove the H1 we injected into content
    newTitle: 'Suez Canal 2026: Strategic Importance and Global Trade', // Shorten title field
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;

  for (const fix of FIXES) {
    const doc: any = await db.collection('blogs').findOne({ slug: fix.slug });
    if (!doc) { console.log('NOT FOUND:', fix.slug); continue; }

    let content: string = doc.content || '';
    let changed = false;

    // Remove injected author-schema <script> tags from content
    if (fix.removeAuthorSchema && content.includes('author-schema')) {
      content = content.replace(/<script type="application\/ld\+json" id="author-schema">[\s\S]*?<\/script>\n?/g, '');
      console.log(`  ${fix.slug}: Removed author-schema script from content`);
      changed = true;
    }

    // Remove injected H1 from content (for Suez Canal)
    if (fix.removeH1 && content.includes('<h1 id="article-title">')) {
      content = content.replace(/<h1 id="article-title">[\s\S]*?<\/h1>\n?/g, '');
      console.log(`  ${fix.slug}: Removed injected H1 from content`);
      changed = true;
    }

    const update: any = {};
    if (changed) update.$set = { content };

    // Update title field for Suez Canal
    if (fix.newTitle) {
      update.$set = update.$set || {};
      update.$set.title = fix.newTitle;
      console.log(`  ${fix.slug}: Updating title to "${fix.newTitle}"`);
    }

    if (Object.keys(update).length > 0) {
      const result = await db.collection('blogs').updateOne({ slug: fix.slug }, update);
      console.log(`  Modified: ${result.modifiedCount}`);
    } else {
      console.log(`  ${fix.slug}: No changes needed`);
    }
  }

  console.log('\nCleanup complete.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
