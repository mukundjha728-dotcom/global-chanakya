import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Mongoose Models
const BlogSchema = new mongoose.Schema({}, { strict: false });
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema, "blogs");

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function countOccurrences(text: string, phrase: string): number {
  if (!phrase || phrase.length < 3) return 0;
  const regex = new RegExp(`\\b${phrase.toLowerCase().replace(/[^a-z0-9]/g, '\\W+')}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

async function run() {
  console.log("=== STARTING GENERATE BACKFILL PLAN ===");
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB.");
  } catch (e) {
    console.error("MongoDB connection failed", e);
    process.exit(1);
  }

  const dataPath = path.join(process.cwd(), 'scripts', 'entity-backfill-suggestions.json');
  if (!fs.existsSync(dataPath)) {
    console.error("Previous audit JSON not found.");
    process.exit(1);
  }

  const previousData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const allSuggestions = previousData.suggestions;

  const blogs = await Blog.find({ status: "published" }).lean();
  const blogMap = new Map(blogs.map((b: any) => [b._id.toString(), b]));

  const approved = [];
  const review = [];
  const rejected = [];
  const rollbackManifest = [];

  // PHASE 1 & 2 - STRICT VALIDATION
  for (const sug of allSuggestions) {
    const blog = blogMap.get(sug.articleId);
    if (!blog) continue;

    const titleText = blog.title || '';
    const excerptText = blog.excerpt || '';
    const contentText = blog.content || '';
    // Extract headings from content
    const headingMatches = contentText.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi);
    const headingsText = headingMatches ? headingMatches.join(" ") : "";

    for (const ent of sug.suggestedEntities) {
      if (ent.confidence !== "HIGH_CONFIDENCE") continue;

      const titleHits = countOccurrences(titleText, ent.name);
      const excerptHits = countOccurrences(excerptText, ent.name);
      const headingHits = countOccurrences(headingsText, ent.name);
      const bodyHits = countOccurrences(contentText.replace(/<[^>]*>/g, ' '), ent.name);

      let classification = "REJECT";
      let evidence = [];

      if (titleHits > 0) evidence.push("In Title");
      if (excerptHits > 0) evidence.push("In Excerpt");
      if (headingHits > 0) evidence.push("In Headings");
      if (bodyHits >= 5) evidence.push(`In Body (${bodyHits} times)`);

      // Strict Rules based on Entity Type
      const isSubstantive = (titleHits > 0 || excerptHits > 0 || headingHits > 0) && bodyHits >= 3;
      
      if (isSubstantive) {
        classification = "AUTO_APPROVE";
      } else if (bodyHits >= 5) {
        classification = "REVIEW";
      } else {
        classification = "REJECT";
      }

      const rec = {
        articleId: sug.articleId,
        slug: sug.slug,
        title: sug.title,
        entityType: ent.type,
        entityId: ent.id,
        entityName: ent.name,
        confidence: classification,
        evidence: evidence.join(", "),
        reason: classification === "AUTO_APPROVE" ? "Substantive discussion detected in key areas." : (classification === "REVIEW" ? "Frequent but incidental mentions." : "Insufficient evidence.")
      };

      if (classification === "AUTO_APPROVE") {
        approved.push(rec);
        
        // Add to rollback manifest
        const fieldName = ent.type.toLowerCase() + (ent.type === 'Country' ? 'ies' : 's');
        rollbackManifest.push({
          articleId: sug.articleId,
          field: fieldName,
          entityId: ent.id
        });
      } else if (classification === "REVIEW") {
        review.push(rec);
      } else {
        rejected.push(rec);
      }
    }
  }

  // PHASE 8 - INTERNAL LINKING PLAN (ORPHANS)
  const orphanPlan = [];
  const orphans: string[] = [];
  for (const slug in previousData.linkGraph) {
     if (previousData.linkGraph[slug].inboundContextual === 0) orphans.push(slug);
  }

  for (const slug of orphans) {
    const blog = blogs.find((b:any) => b.slug === slug);
    if (!blog) continue;
    
    // Find semantically related blogs that are NOT orphans
    const related = blogs.filter((b:any) => 
      b.slug !== slug && 
      !orphans.includes(b.slug) &&
      (
        (b.topics && blog.topics && b.topics.some((t:any) => blog.topics.map((bt:any)=>bt.toString()).includes(t.toString()))) ||
        (b.countries && blog.countries && b.countries.some((c:any) => blog.countries.map((bc:any)=>bc.toString()).includes(c.toString())))
      )
    ).slice(0, 3).map((b:any) => b.slug);

    orphanPlan.push({
      articleId: blog._id.toString(),
      slug: blog.slug,
      title: blog.title,
      relevantTopicPages: blog.topics || [],
      relevantCountryPages: blog.countries || [],
      relevantRegionPages: blog.regions || [],
      relevantLeaderPages: blog.leaders || [],
      relevantConflictPages: blog.conflicts || [],
      semanticallyRelatedPublishedArticles: related
    });
  }

  // PHASE 10 - IMAGE GAP
  const missingImageBlogs = blogs.filter((b:any) => !b.featuredImage && !b.ogImage);
  const imageCandidates = [];
  
  console.log(`Checking ${missingImageBlogs.length} articles for missing images...`);
  for (const b of missingImageBlogs) {
    let candidate = null;
    let reason = "Wikipedia API search failed.";
    let confidence = "LOW";
    let srcUrl = "";
    
    try {
      const q = encodeURIComponent(b.title.substring(0, 50));
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&utf8=&format=json&srlimit=1`;
      const sRes = await fetch(searchUrl);
      const sData: any = await sRes.json();
      
      if (sData?.query?.search?.length > 0) {
        const title = sData.query.search[0].title;
        const imgUrlReq = `https://en.wikipedia.org/w/api.php?action=query&prop=images&titles=${encodeURIComponent(title)}&imlimit=10&format=json`;
        const imgRes = await fetch(imgUrlReq);
        const imgData: any = await imgRes.json();
        const pages = imgData?.query?.pages || {};
        const page = Object.values(pages)[0] as any;
        
        if (page?.images && page.images.length > 0) {
          const imgTitle = page.images.find((im:any) => !im.title.toLowerCase().endsWith('.svg') && !im.title.toLowerCase().includes('icon'))?.title;
          if (imgTitle) {
            candidate = imgTitle;
            srcUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
            reason = `Found related Wikipedia page: ${title}`;
            confidence = "REVIEW";
          }
        }
      }
    } catch(e) {}
    
    imageCandidates.push({
      articleId: b._id.toString(),
      slug: b.slug,
      candidateImage: candidate || "NONE",
      source: "Wikipedia",
      sourceUrl: srcUrl,
      reason,
      confidence
    });
    
    await sleep(200); // Rate limiting
  }

  // Write outputs
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'entity-backfill-approved.json'), JSON.stringify(approved, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'entity-backfill-review.json'), JSON.stringify(review, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'entity-backfill-rejected.json'), JSON.stringify(rejected, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'entity-backfill-rollback-manifest.json'), JSON.stringify(rollbackManifest, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'orphan-linking-plan.json'), JSON.stringify(orphanPlan, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'image-candidate-report.json'), JSON.stringify(imageCandidates, null, 2));
  
  console.log(`Dry Run Complete:
  AUTO_APPROVE: ${approved.length}
  REVIEW: ${review.length}
  REJECT: ${rejected.length}
  ORPHANS: ${orphanPlan.length}
  IMAGE CANDIDATES: ${imageCandidates.length}`);

  process.exit(0);
}

run().catch(console.error);
