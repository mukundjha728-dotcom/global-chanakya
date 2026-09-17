import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const Blog = mongoose.model("Blog", new mongoose.Schema({}, { strict: false }), "blogs");

  const candidates = [
    { name: "Serbia–Kosovo tensions", query: { $or: [{ slug: /serbia/i }, { title: /serbia/i }] } },
    { name: "Yemen Civil War", query: { $or: [{ slug: /yemen/i }, { title: /yemen/i }] } },
    { name: "Russia–Ukraine timeline", query: { $or: [{ slug: /ukraine.*timeline/i }, { title: /ukraine.*timeline/i }, { slug: /russia.*ukraine/i }] } },
    { name: "Suez Canal strategic importance", query: { $or: [{ slug: /suez/i }, { title: /suez/i }] } },
    { name: "Syria conflict / power map", query: { $or: [{ slug: /syria/i }, { title: /syria/i }] } }
  ];

  const results: any = {};

  for (const c of candidates) {
    const docs = await Blog.find(c.query).limit(5).lean() as any[];
    
    // Attempt to pick the best match
    let best = docs[0];
    if (c.name.includes("timeline")) best = docs.find((d: any) => d.slug.includes("timeline") || d.title.toLowerCase().includes("timeline")) || best;
    
    if (best) {
      const inboundLinks = await Blog.countDocuments({ "relatedArticles": best._id });
      // Calculate contextual links by searching for slug in content of other articles
      const contextualLinks = await Blog.countDocuments({ content: { $regex: best.slug, $options: "i" }, _id: { $ne: best._id } });

      results[c.name] = {
        name: c.name,
        slug: best.slug,
        title: best.title,
        status: best.status,
        contentType: best.contentType,
        category: best.category,
        publishDate: best.publishAt || best.createdAt,
        updatedDate: best.updatedAt,
        author: best.author,
        topics: best.topics,
        countries: best.countries,
        regions: best.regions,
        leaders: best.leaders,
        conflicts: best.conflicts,
        tags: best.tags,
        seo: best.seo,
        featuredImage: best.featuredImage,
        markdown: best.markdown,
        content: best.content,
        // Relations
        relatedArticlesCount: best.relatedArticles ? best.relatedArticles.length : 0,
        inboundRelatedCount: inboundLinks,
        contextualInboundCount: contextualLinks,
      };
    } else {
      results[c.name] = null;
    }
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'gsc-top5-forensic.json'),
    JSON.stringify(results, null, 2)
  );
  console.log("Done extracting data to scripts/gsc-top5-forensic.json");
  process.exit(0);
}

run().catch(console.error);
