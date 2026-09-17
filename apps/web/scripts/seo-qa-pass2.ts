import mongoose from 'mongoose';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SITE_URL = "https://www.globalchanakya.in";
const LOCAL_URL = "http://localhost:3000";

// Mongoose Models Setup
const BlogSchema = new mongoose.Schema({}, { strict: false });
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema, "blogs");

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", UserSchema, "users");

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runQA() {
  console.log("=== STARTING QA SCRIPT ===");
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB.");
  } catch (e) {
    console.error("MongoDB connection failed", e);
    process.exit(1);
  }

  const report: any = {};

  console.log("\n[1] Database Analytics...");
  const publishedBlogs = await Blog.find({ status: "published" }).lean();
  report.totalPublished = publishedBlogs.length;

  let missingTitle = 0, missingSlug = 0, missingDesc = 0, missingImage = 0, missingAuthor = 0, missingCategory = 0, missingTopics = 0, missingCountries = 0, missingDates = 0;
  const titles = new Set();
  const descriptions = new Set();
  const canonicals = new Set();
  
  let duplicateTitles = 0, duplicateDesc = 0, duplicateCanonicals = 0;

  for (const b of publishedBlogs) {
    if (!b.title) missingTitle++;
    if (!b.slug) missingSlug++;
    if (!b.seo?.description && !b.excerpt) missingDesc++;
    if (!b.featuredImage && !b.ogImage) missingImage++;
    if (!b.author) missingAuthor++;
    if (!b.category) missingCategory++;
    if (!b.topics || b.topics.length === 0) missingTopics++;
    if (!b.countries || b.countries.length === 0) missingCountries++;
    if (!b.publishAt) missingDates++;

    const title = (b.seo?.title || b.title)?.trim().toLowerCase();
    const desc = (b.seo?.description || b.excerpt)?.trim().toLowerCase();
    const can = (b.seo?.canonicalUrl || `${SITE_URL}/blogs/${b.slug}`)?.trim().toLowerCase();

    if (title && titles.has(title)) duplicateTitles++;
    titles.add(title);
    
    if (desc && descriptions.has(desc)) duplicateDesc++;
    descriptions.add(desc);

    if (can && canonicals.has(can)) duplicateCanonicals++;
    canonicals.add(can);
  }

  report.db = {
    missingTitle, missingSlug, missingDesc, missingImage, missingAuthor, missingCategory, missingTopics, missingCountries, missingDates,
    duplicateTitles, duplicateDesc, duplicateCanonicals
  };
  console.log(report.db);

  // Wait for server to be responsive
  console.log("\n[2] Pinging Local Server...");
  let serverUp = false;
  for (let i=0; i<30; i++) {
    try {
      const res = await fetch(`${LOCAL_URL}/`);
      if (res.ok) {
        serverUp = true;
        break;
      }
    } catch(e) {}
    await sleep(2000);
  }
  
  if (!serverUp) {
    console.error("Local server is not reachable at", LOCAL_URL);
    process.exit(1);
  }
  console.log("Server is up!");

  console.log("\n[3] Testing Robots.txt...");
  const robotsRes = await fetch(`${LOCAL_URL}/robots.txt`);
  const robotsTxt = await robotsRes.text();
  report.robots = {
    content: robotsTxt,
    hasGoogleBot: robotsTxt.includes("Googlebot"),
    hasOAIBot: robotsTxt.includes("OAI-SearchBot"),
    blocksAdmin: robotsTxt.includes("Disallow: /gc-control-9x7k"),
    allowsAll: robotsTxt.includes("Allow: /") || robotsTxt.includes("User-Agent: *"),
  };
  console.log("Robots.txt parsed.", report.robots);

  console.log("\n[4] Testing Sitemap.xml...");
  const sitemapRes = await fetch(`${LOCAL_URL}/sitemap.xml`);
  const sitemapXml = await sitemapRes.text();
  
  report.sitemap = {
    totalUrls: 0,
    invalidUrls: 0,
    nonCanonicalUrls: 0,
    noindexLeaks: 0,
  };

  // Manual XML parse to avoid installing dependencies
  try {
    if (sitemapXml.includes("<sitemapindex")) {
      console.log("Sitemap is an index. Inspecting child sitemaps...");
      const sitemapTags = sitemapXml.match(/<loc>(.*?)<\/loc>/g) || [];
      // Test first 2 sitemaps
      for (let i = 0; i < Math.min(2, sitemapTags.length); i++) {
        const smLoc = sitemapTags[i].replace("<loc>", "").replace("</loc>", "").replace(SITE_URL, LOCAL_URL);
        const childRes = await fetch(smLoc);
        const childXml = await childRes.text();
        const urls = childXml.match(/<loc>(.*?)<\/loc>/g) || [];
        report.sitemap.totalUrls += urls.length;
        for (const loc of urls) {
          const l = loc.replace("<loc>", "").replace("</loc>", "");
          if (!l.startsWith("https://www.globalchanakya.in")) report.sitemap.nonCanonicalUrls++;
        }
      }
    } else {
      const urls = sitemapXml.match(/<loc>(.*?)<\/loc>/g) || [];
      report.sitemap.totalUrls = urls.length;
      for (const loc of urls) {
        const l = loc.replace("<loc>", "").replace("</loc>", "");
        if (!l.startsWith("https://www.globalchanakya.in")) report.sitemap.nonCanonicalUrls++;
      }
    }
  } catch (e) {
    console.error("Failed to parse sitemap XML", e);
  }
  console.log("Sitemap audit:", report.sitemap);

  console.log("\n[5] Testing LLMS.txt...");
  const llmsRes = await fetch(`${LOCAL_URL}/llms.txt`);
  const llmsTxt = await llmsRes.text();
  report.llms = {
    accessible: llmsRes.ok,
    length: llmsTxt.length,
    containsUrl: llmsTxt.includes("https://www.globalchanakya.in/blogs/"),
  };
  console.log("LLMS.txt check:", report.llms);

  console.log("\n[6] Sampling Real URLs (Raw SSR & JSON-LD)...");
  const sampleBlogs = publishedBlogs.slice(0, 10);
  report.ssr = {
    checked: 0,
    hasTitle: 0,
    hasCanonical: 0,
    hasJsonLd: 0,
    hasH1: 0,
    validJsonLd: 0,
    inboundLinksStats: []
  };

  for (const b of sampleBlogs) {
    const res = await fetch(`${LOCAL_URL}/blogs/${b.slug}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    report.ssr.checked++;
    if ($('title').length > 0) report.ssr.hasTitle++;
    if ($('link[rel="canonical"]').attr('href')?.startsWith(SITE_URL)) report.ssr.hasCanonical++;
    if ($('h1').length > 0) report.ssr.hasH1++;
    
    // JSON-LD
    const scripts = $('script[type="application/ld+json"]');
    if (scripts.length > 0) {
      report.ssr.hasJsonLd++;
      try {
        let valid = false;
        scripts.each((i, el) => {
          const content = $(el).html();
          if (content && content.includes(SITE_URL)) {
             JSON.parse(content);
             valid = true;
          }
        });
        if (valid) report.ssr.validJsonLd++;
      } catch(e) {}
    }
    
    // Links logic
    const internalLinks = $('a').filter((i, el) => {
      const href = $(el).attr('href');
      return !!href && href.startsWith('/');
    }).length;

    report.ssr.inboundLinksStats.push({ slug: b.slug, outboundInternalLinks: internalLinks });
  }
  console.log("SSR audit:", report.ssr);

  // Write report
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'qa-report.json'), JSON.stringify(report, null, 2));
  console.log("\n=== QA REPORT SAVED TO scripts/qa-report.json ===");
  process.exit(0);
}

runQA().catch(console.error);
