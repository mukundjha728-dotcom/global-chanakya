import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;

  const TARGET_SLUGS = [
    'serbia-kosovo-tensions-explained-2026',
    'yemen-civil-war-strategic-importance-2026',
    'russia-ukraine-war-timeline-strategic-analysis-2026',
    'suez-canal-2026-strategic-importance-global-trade-egypt',
  ];

  // --- 1. Backup target articles ---
  console.log('=== BACKING UP TARGET ARTICLES ===');
  const articles: Record<string, any> = {};
  for (const slug of TARGET_SLUGS) {
    const doc = await db.collection('blogs').findOne({ slug });
    if (!doc) { console.log('NOT FOUND: ' + slug); continue; }
    articles[slug] = doc;
    console.log(`Found: ${slug} | title: ${doc.title}`);
  }

  // --- 2. Look up ALL country entities ---
  console.log('\n=== COUNTRY ENTITIES ===');
  const countries = await db.collection('countries').find({}).toArray();
  for (const c of countries) {
    console.log(`  ${c._id} | name: ${c.name || c.title}`);
  }

  // --- 3. Look up ALL leader entities ---
  console.log('\n=== LEADER ENTITIES ===');
  const leaders = await db.collection('leaders').find({}).toArray();
  for (const l of leaders) {
    console.log(`  ${l._id} | name: ${l.name || l.title}`);
  }

  // --- 4. Look up ALL conflict entities ---
  console.log('\n=== CONFLICT ENTITIES ===');
  const conflicts = await db.collection('conflicts').find({}).toArray();
  for (const c of conflicts) {
    console.log(`  ${c._id} | name: ${c.name || c.title}`);
  }

  // --- 5. Look up author ---
  console.log('\n=== AUTHOR DATA ===');
  const authorId = articles[TARGET_SLUGS[0]]?.author;
  if (authorId) {
    const author = await db.collection('users').findOne({ _id: authorId }) ||
                   await db.collection('authors').findOne({ _id: authorId });
    console.log('Author doc:', JSON.stringify(author, null, 2));
  } else {
    // Try users collection with the known ID
    const allUsers = await db.collection('users').find({}).toArray();
    console.log('All users:');
    for (const u of allUsers) {
      console.log(`  ${u._id} | name: ${u.name || u.firstName} | email: ${u.email}`);
    }
    const allAuthors = await db.collection('authors').find({}).toArray();
    console.log('All authors:');
    for (const a of allAuthors) {
      console.log(`  ${a._id} | name: ${a.name || a.firstName}`);
    }
  }

  // --- 6. Find candidate articles for contextual linking ---
  console.log('\n=== CANDIDATE LINKING ARTICLES ===');
  // Look for articles that mention Serbia, Kosovo, Yemen, Russia, Ukraine, Suez in title/slug
  const linkCandidates = await db.collection('blogs').find({
    status: 'published',
    slug: { $nin: TARGET_SLUGS },
    $or: [
      { title: { $regex: /serbia|kosovo|balkans|europe security/i } },
      { title: { $regex: /yemen|houthi|red sea|bab al/i } },
      { title: { $regex: /russia|ukraine|zelensky|putin/i } },
      { title: { $regex: /suez|egypt|maritime|shipping|canal/i } },
      { title: { $regex: /iran|middle east|gulf|saudi/i } },
      { title: { $regex: /nato|conflict|war|geopolit/i } },
    ]
  }, { projection: { slug: 1, title: 1, content: 1 } }).limit(40).toArray();

  console.log(`Found ${linkCandidates.length} candidate articles for contextual linking:`);
  for (const c of linkCandidates) {
    console.log(`  slug: ${c.slug}`);
    console.log(`  title: ${c.title}`);
    // Check if any target slug appears in content (would mean link already exists)
    for (const ts of TARGET_SLUGS) {
      if (c.content && c.content.includes(ts)) {
        console.log(`    [ALREADY LINKS TO: ${ts}]`);
      }
    }
  }

  // --- 7. Look up topic entities ---
  console.log('\n=== TOPIC ENTITIES ===');
  const topics = await db.collection('topics').find({}).toArray();
  for (const t of topics) {
    console.log(`  ${t._id} | name: ${t.name || t.title}`);
  }

  // --- 8. Save full backup ---
  const backup = {
    timestamp: new Date().toISOString(),
    articles,
    entities: {
      countries: countries.map(c => ({ _id: c._id.toString(), name: c.name || c.title, slug: c.slug })),
      leaders: leaders.map(l => ({ _id: l._id.toString(), name: l.name || l.title, slug: l.slug })),
      conflicts: conflicts.map(c => ({ _id: c._id.toString(), name: c.name || c.title, slug: c.slug })),
      topics: topics.map(t => ({ _id: t._id.toString(), name: t.name || t.title, slug: t.slug })),
    },
    linkCandidates: linkCandidates.map(c => ({ _id: c._id.toString(), slug: c.slug, title: c.title })),
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'gsc-top4-backup.json'),
    JSON.stringify(backup, null, 2)
  );
  console.log('\nBackup saved to scripts/gsc-top4-backup.json');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
