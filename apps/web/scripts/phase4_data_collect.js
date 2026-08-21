require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');

async function runPhase4Audit() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const db = mongoose.connection.db;

  // 1. Entity counts
  const counts = {
    blogs_total: await db.collection('blogs').countDocuments(),
    blogs_published: await db.collection('blogs').countDocuments({ status: 'published' }),
    blogs_draft: await db.collection('blogs').countDocuments({ status: 'draft' }),
    categories: await db.collection('categories').countDocuments(),
    topics: await db.collection('topics').countDocuments(),
    countries: await db.collection('countries').countDocuments(),
    regions: await db.collection('regions').countDocuments(),
    leaders: await db.collection('leaders').countDocuments(),
    conflicts: await db.collection('conflicts').countDocuments(),
    organizations: await db.collection('organizations').countDocuments(),
  };
  console.log('COUNTS:', JSON.stringify(counts));

  // 2. All published blogs - full SEO fields
  const blogs = await db.collection('blogs').find(
    { status: 'published' },
    { projection: {
      _id: 1, title: 1, slug: 1, category: 1, tags: 1,
      categoryId: 1, topics: 1, countries: 1, regions: 1,
      leaders: 1, conflicts: 1, organizations: 1,
      author: 1, publishAt: 1, updatedAt: 1, createdAt: 1,
      'seo.title': 1, 'seo.description': 1, 'seo.keywords': 1, 'seo.canonicalUrl': 1,
      featuredImage: 1, content: 1, faq: 1, status: 1,
      'analytics.views': 1, readTime: 1, excerpt: 1
    }}
  ).toArray();

  // Calculate content length for each blog
  const blogsWithMeta = blogs.map(b => ({
    ...b,
    contentLength: b.content ? (Array.isArray(b.content) ? JSON.stringify(b.content).length : b.content.length) : 0,
    hasFaq: !!(b.faq && b.faq.length > 0),
    faqCount: b.faq ? b.faq.length : 0,
    hasImage: !!(b.featuredImage && b.featuredImage.url),
    imageAlt: b.featuredImage ? b.featuredImage.alt : null,
    hasSeoTitle: !!(b.seo && b.seo.title),
    hasSeoDesc: !!(b.seo && b.seo.description),
    seoTitleLength: b.seo && b.seo.title ? b.seo.title.length : 0,
    seoDescLength: b.seo && b.seo.description ? b.seo.description.length : 0,
    titleLength: b.title ? b.title.length : 0,
    topicsCount: b.topics ? b.topics.length : 0,
    countriesCount: b.countries ? b.countries.length : 0,
    leadersCount: b.leaders ? b.leaders.length : 0,
    conflictsCount: b.conflicts ? b.conflicts.length : 0,
    orgsCount: b.organizations ? b.organizations.length : 0,
    content: undefined, // strip content to save space
  }));

  fs.writeFileSync('/tmp/phase4_blogs.json', JSON.stringify(blogsWithMeta, null, 2));
  console.log('BLOG_COUNT:', blogs.length);

  // 3. Entity data with article counts
  const entityTypes = [
    { col: 'categories', name: 'categories' },
    { col: 'topics', name: 'topics' },
    { col: 'countries', name: 'countries' },
    { col: 'regions', name: 'regions' },
    { col: 'leaders', name: 'leaders' },
    { col: 'conflicts', name: 'conflicts' },
    { col: 'organizations', name: 'organizations' },
  ];

  const entityData = {};
  for (const et of entityTypes) {
    const docs = await db.collection(et.col).find({}, {
      projection: { _id: 1, name: 1, slug: 1, status: 1, description: 1, 'seo.title': 1, 'seo.description': 1 }
    }).toArray();

    // Count articles per entity
    for (const doc of docs) {
      const fieldMap = {
        categories: 'categoryId',
        topics: 'topics',
        countries: 'countries',
        regions: 'regions',
        leaders: 'leaders',
        conflicts: 'conflicts',
        organizations: 'organizations',
      };
      const field = fieldMap[et.col];
      const count = await db.collection('blogs').countDocuments({ [field]: doc._id, status: 'published' });
      doc.articleCount = count;
    }
    entityData[et.name] = docs;
  }

  fs.writeFileSync('/tmp/phase4_entities.json', JSON.stringify(entityData, null, 2));

  // 4. Duplicate/near-duplicate title analysis
  const titles = blogsWithMeta.map(b => ({ _id: b._id, title: b.title, slug: b.slug, seoTitle: b.seo && b.seo.title }));
  fs.writeFileSync('/tmp/phase4_titles.json', JSON.stringify(titles, null, 2));

  // 5. Sample actual content text from a few articles for structural analysis
  const sampleSlugs = await db.collection('blogs').find(
    { status: 'published' },
    { projection: { slug: 1, title: 1, content: 1 }, limit: 10 }
  ).limit(10).toArray();

  const contentSamples = sampleSlugs.map(b => ({
    slug: b.slug,
    title: b.title,
    contentType: typeof b.content,
    contentPreview: b.content ? (typeof b.content === 'string' ? b.content.substring(0, 500) : JSON.stringify(b.content).substring(0, 500)) : null
  }));
  fs.writeFileSync('/tmp/phase4_content_samples.json', JSON.stringify(contentSamples, null, 2));

  console.log('ENTITY_COUNTS:', JSON.stringify(Object.fromEntries(Object.entries(entityData).map(([k,v]) => [k, v.length]))));
  console.log('DONE');
  await mongoose.connection.close();
}

runPhase4Audit().catch(e => { console.error(e); process.exit(1); });
