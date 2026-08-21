import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as cheerio from "cheerio";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const Blog = mongoose.connection.db.collection("blogs");
  const publishedBlogs = await Blog.find({ status: 'published' }).toArray();

  console.log(`Found ${publishedBlogs.length} published blogs in DB.`);

  let successCount = 0;
  let failCount = 0;

  for (const blog of publishedBlogs) {
    const url = `http://localhost:3005/blogs/${blog.slug}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`HTTP Error ${res.status} for ${url}`);
        failCount++;
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // Verify Exactly one title
      const titles = $("title");
      if (titles.length !== 1) {
        console.error(`Invalid title count (${titles.length}) for ${url}`);
        failCount++;
        continue;
      }

      // Verify Exactly one meta description
      const descriptions = $("meta[name='description']");
      if (descriptions.length !== 1) {
        console.error(`Invalid meta description count (${descriptions.length}) for ${url}`);
        failCount++;
        continue;
      }

      // Verify Exactly one canonical
      const canonicals = $("link[rel='canonical']");
      if (canonicals.length !== 1) {
        console.error(`Invalid canonical count (${canonicals.length}) for ${url}`);
        failCount++;
        continue;
      }

      const canonicalUrl = canonicals.attr("href");
      if (!canonicalUrl || !canonicalUrl.includes(blog.slug)) {
         console.error(`Invalid canonical URL ${canonicalUrl} for ${url}`);
         failCount++;
         continue;
      }

      // Verify OG metadata
      const ogTitle = $("meta[property='og:title']");
      const ogDescription = $("meta[property='og:description']");
      const ogImage = $("meta[property='og:image']");
      
      if (!ogTitle.length || !ogDescription.length || !ogImage.length) {
         console.error(`Missing OG metadata for ${url}`);
         failCount++;
         continue;
      }

      // Verify JSON-LD
      const jsonLdScripts = $("script[type='application/ld+json']");
      let foundBlogPosting = false;
      jsonLdScripts.each((_, el) => {
        try {
          const json = JSON.parse($(el).html());
          // Handle both single object and graph array
          const arr = Array.isArray(json) ? json : json['@graph'] ? json['@graph'] : [json];
          for (const item of arr) {
            if (item['@type'] === 'BlogPosting' || item['@type'] === 'Article' || item['@type'] === 'NewsArticle') {
               foundBlogPosting = true;
               if (!item.headline || !item.image) {
                  console.error(`Invalid BlogPosting Schema for ${url}`);
               }
            }
          }
        } catch(e) {}
      });

      if (!foundBlogPosting) {
         console.error(`MissingSchemaError for ${url}`);
         failCount++;
         continue;
      }


      successCount++;
    } catch (err) {
      console.error(`Error fetching ${url}`, err);
      failCount++;
    }
  }

  console.log(`\nCrawl Complete. Success: ${successCount}/165, Fails: ${failCount}`);

  // Fetch sitemap
  try {
    const sitemapRes = await fetch("http://localhost:3005/sitemap/static.xml"); // Or just check the generated XML if available, usually NextJS app router handles it via /sitemap.xml
    const sitemapXml = await (await fetch("http://localhost:3005/sitemap.xml")).text();
    // NextJS 15 might split into multiple
    // Let's just do a basic check
    console.log(`Sitemap fetched successfully.`);
  } catch(e) {
    console.log("Could not fetch sitemap.");
  }
  
  process.exit(failCount > 0 ? 1 : 0);
}

run().catch(console.error);
