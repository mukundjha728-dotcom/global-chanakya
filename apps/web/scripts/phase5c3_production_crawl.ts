import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as cheerio from "cheerio";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const BASE_URL = "https://www.globalchanakya.in";

const MANIFEST_PATH = "C:\\Users\\mukun\\.gemini\\antigravity-ide\\brain\\76d58757-7674-4135-8447-6d89f0a69a1a\\seo_phase5c_change_manifest.json";

async function fetchWithTimeout(url: string, options: any = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const Blog = mongoose.connection.db.collection("blogs");
  const publishedBlogs = await Blog.find({ status: 'published' }).toArray();

  console.log(`Found ${publishedBlogs.length} published blogs in DB.`);

  let manifest = [];
  if (fs.existsSync(MANIFEST_PATH)) {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } else {
      console.log("No manifest found");
  }
  const optimizedIds = manifest.map((m: any) => m.id);

  let successCount = 0;
  let failCount = 0;
  let missingSchemaCount = 0;
  let canonicalMismatches = 0;
  let missingOg = 0;
  let missingTitleDesc = 0;

  console.log(`\n--- Running Full Live Production Crawl ---`);

  const BATCH_SIZE = 10;
  for (let i = 0; i < publishedBlogs.length; i += BATCH_SIZE) {
    const batch = publishedBlogs.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (blog) => {
        const url = `${BASE_URL}/blogs/${blog.slug}`;
        try {
          const res = await fetchWithTimeout(url);
          if (!res.ok) {
            console.error(`HTTP Error ${res.status} for ${url}`);
            failCount++;
            return;
          }

          const html = await res.text();
          const $ = cheerio.load(html);

          const title = $("title").text();
          const description = $("meta[name='description']").attr("content");

          if (!title || !description) {
            missingTitleDesc++;
          }

          const canonicalUrl = $("link[rel='canonical']").attr("href");
          if (!canonicalUrl || canonicalUrl !== url) {
            console.error(`Canonical mismatch: expected ${url}, got ${canonicalUrl}`);
            canonicalMismatches++;
          }

          const ogTitle = $("meta[property='og:title']").attr("content");
          const ogDescription = $("meta[property='og:description']").attr("content");
          const ogImage = $("meta[property='og:image']").attr("content");
          
          if (!ogTitle || !ogDescription || !ogImage) {
            missingOg++;
          }

          const jsonLdScripts = $("script[type='application/ld+json']");
          let foundBlogPosting = false;
          jsonLdScripts.each((_, el) => {
            try {
              const json = JSON.parse($(el).html());
              const arr = Array.isArray(json) ? json : json['@graph'] ? json['@graph'] : [json];
              for (const item of arr) {
                if (item['@type'] === 'BlogPosting' || item['@type'] === 'Article' || item['@type'] === 'NewsArticle') {
                  foundBlogPosting = true;
                }
              }
            } catch(e) {}
          });

          if (!foundBlogPosting) {
            missingSchemaCount++;
          }

          successCount++;
        } catch (err: any) {
          console.error(`Error fetching ${url}: ${err.message}`);
          failCount++;
        }
    }));
    
    console.log(`Processed ${Math.min(i + BATCH_SIZE, publishedBlogs.length)}/${publishedBlogs.length}`);
  }

  console.log(`\nCrawl Complete.`);
  console.log(`Success: ${successCount}/165`);
  console.log(`Fails: ${failCount}`);
  console.log(`MissingSchema: ${missingSchemaCount}`);
  console.log(`Canonical Mismatches: ${canonicalMismatches}`);
  console.log(`Missing OG: ${missingOg}`);
  console.log(`Missing Title/Desc: ${missingTitleDesc}`);

  process.exit(0);
}

run().catch(console.error);
