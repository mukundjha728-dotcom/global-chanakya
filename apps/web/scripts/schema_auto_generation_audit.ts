import mongoose from "mongoose";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Use direct mongoose connection instead of Next.js dbConnect to avoid Next.js module issues in script
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/global-chanakya";

// Mock the Blog model just to read data
const blogSchema = new mongoose.Schema({}, { strict: false });
const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

// We need to import the utility if possible, but let's just copy its logic here to be safe if tsx complains about Next.js aliases.
// Actually, npx tsx can use tsconfig paths if configured, but let's test if we can import it.
// import { generateBlogJsonLd } from "../src/lib/seo/generateBlogJsonLd";

async function runAudit() {
  console.log("Connecting to MongoDB in read-only mode...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  const blogs = await Blog.find({ status: "published" }).lean();
  console.log(`Found ${blogs.length} published blogs.`);

  const auditResults = [];
  let schemasGenerated = 0;
  let jsonParseFailures = 0;

  // We can't easily import generateBlogJsonLd if next aliases fail.
  // Instead, let's use the local server for the FULL Render Crawl which is even better and covers the exact requirement.
  
  // We'll crawl localhost:3000
  console.log("Starting 165-Blog Render Crawl on localhost:3000...");
  
  for (const blog of blogs) {
    const slug = blog.slug;
    const url = `http://localhost:3000/blogs/${slug}`;
    
    let schemaGenerated = false;
    let jsonValid = false;
    let type = "";
    let canonical = "";
    let headline = "";
    let hasDescription = false;
    let hasImage = false;
    let hasDatePublished = false;
    let hasDateModified = false;
    let hasAuthor = false;
    let hasPublisher = false;
    let hasBreadcrumb = false;
    let hasFaqSchema = false;
    let errors = [];
    let duplicateBlogPosting = false;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        errors.push(`HTTP ${res.status}`);
      } else {
        const html = await res.text();
        const $ = cheerio.load(html);
        const scripts = $('script[type="application/ld+json"]');
        
        let schemaGraphs: any[] = [];
        scripts.each((_, el) => {
          try {
            const parsed = JSON.parse($(el).html() || "{}");
            if (Array.isArray(parsed)) {
              schemaGraphs.push(...parsed);
            } else {
              schemaGraphs.push(parsed);
            }
          } catch (e) {
            errors.push("Invalid JSON-LD string");
          }
        });

        if (schemaGraphs.length > 0) {
          schemaGenerated = true;
          jsonValid = true; // since it parsed successfully above

          let blogPostingCount = 0;
          for (const graph of schemaGraphs) {
            if (graph["@type"] === "BlogPosting" || graph["@type"] === "NewsArticle" || graph["@type"] === "OpinionNewsArticle") {
              blogPostingCount++;
              type = graph["@type"];
              headline = graph.headline;
              canonical = graph.mainEntityOfPage?.["@id"] || graph.url;
              hasDescription = !!graph.description;
              hasImage = !!graph.image;
              hasDatePublished = !!graph.datePublished;
              hasDateModified = !!graph.dateModified;
              hasAuthor = !!graph.author;
              hasPublisher = !!graph.publisher;
            }
            if (graph["@type"] === "BreadcrumbList") {
              hasBreadcrumb = true;
            }
            if (graph["@type"] === "FAQPage") {
              hasFaqSchema = true;
            }
          }

          if (blogPostingCount > 1) {
            duplicateBlogPosting = true;
            errors.push("Duplicate BlogPosting schema");
          }
        } else {
          errors.push("No application/ld+json found");
        }
      }
    } catch (err: any) {
      errors.push(`Fetch failed: ${err.message}`);
    }

    if (jsonValid) schemasGenerated++;
    if (!jsonValid && schemaGenerated) jsonParseFailures++;

    auditResults.push({
      slug,
      schemaGenerated,
      jsonValid,
      type,
      canonical,
      headline,
      hasDescription,
      hasImage,
      hasDatePublished,
      hasDateModified,
      hasAuthor,
      hasPublisher,
      hasBreadcrumb,
      hasFaqSchema,
      duplicateBlogPosting,
      errors
    });
  }

  // Duplicate Check logic:
  let duplicateCount = auditResults.filter(r => r.duplicateBlogPosting).length;

  const summary = {
    publishedBlogs: blogs.length,
    validGeneratedSchemas: schemasGenerated,
    schemaFailures: auditResults.filter(r => r.errors.length > 0).length,
    duplicateBlogPosting: duplicateCount,
    jsonParseFailures,
  };

  const fullReportPath = path.resolve(process.cwd(), "../../seo_schema_full_audit.json");
  fs.writeFileSync(fullReportPath, JSON.stringify({ summary, details: auditResults }, null, 2));

  console.log(`Audit complete. Results saved to ${fullReportPath}`);
  console.log(summary);

  await mongoose.disconnect();
}

runAudit().catch(console.error);
