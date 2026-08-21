const http = require('http');
const https = require('https');
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const BlogSchema = new mongoose.Schema({}, { strict: false, collection: 'blogs' });
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

const CategorySchema = new mongoose.Schema({}, { strict: false, collection: 'categories' });
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const TopicSchema = new mongoose.Schema({}, { strict: false, collection: 'topics' });
const Topic = mongoose.models.Topic || mongoose.model("Topic", TopicSchema);
const CountrySchema = new mongoose.Schema({}, { strict: false, collection: 'countries' });
const Country = mongoose.models.Country || mongoose.model("Country", CountrySchema);
const RegionSchema = new mongoose.Schema({}, { strict: false, collection: 'regions' });
const Region = mongoose.models.Region || mongoose.model("Region", RegionSchema);
const LeaderSchema = new mongoose.Schema({}, { strict: false, collection: 'leaders' });
const Leader = mongoose.models.Leader || mongoose.model("Leader", LeaderSchema);
const ConflictSchema = new mongoose.Schema({}, { strict: false, collection: 'conflicts' });
const Conflict = mongoose.models.Conflict || mongoose.model("Conflict", ConflictSchema);
const OrganizationSchema = new mongoose.Schema({}, { strict: false, collection: 'organizations' });
const Organization = mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);

const PROD_URL = "https://www.globalchanakya.in";

async function fetchHtml(url, userAgent = 'Mozilla/5.0') {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ html: data, status: res.statusCode, headers: res.headers }));
    });
    req.on('error', () => resolve({ status: 500, html: '' }));
    req.setTimeout(8000, () => { req.abort(); resolve({ status: 408, html: '' }); });
  });
}

function extractMeta(html, name) {
  const match = html.match(new RegExp(`<meta(?:\\s+[^>]*?)?\\s+(?:name|property)=["']${name}["'](?:\\s+[^>]*?)?\\s+content=["'](.*?)["']`, 'i')) || 
                html.match(new RegExp(`<meta(?:\\s+[^>]*?)?\\s+content=["'](.*?)["'](?:\\s+[^>]*?)?\\s+(?:name|property)=["']${name}["']`, 'i'));
  return match ? match[1] : null;
}

async function runAudit() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const allBlogs = await Blog.find({}).select("slug status").lean();
  const publishedBlogs = allBlogs.filter(b => b.status === 'published');
  
  console.log(`\n=== PART A & B: TAXONOMY ===`);
  const models = { Category, Topic, Country, Region, Leader, Conflict, Organization };
  const typeMap = { Category: 'categories', Topic: 'topics', Country: 'countries', Region: 'regions', Leader: 'leaders', Conflict: 'conflicts', Organization: 'organizations' };
  
  let thinPass = true;
  let indexablePass = true;

  for (const [name, model] of Object.entries(models)) {
    const items = await model.find({}).lean();
    const thin = items.filter(i => (i.articleCount || 0) < 4).slice(0, 2);
    const valid = items.filter(i => (i.articleCount || 0) >= 4).slice(0, 1);
    
    for (const t of thin) {
      if(!t.slug) continue;
      const url = `${PROD_URL}/${typeMap[name]}/${t.slug}`;
      const res = await fetchHtml(url);
      const robots = extractMeta(res.html, 'robots') || "";
      if (res.status === 200 && !robots.includes('noindex')) {
        console.log(`[WARNING] Thin entity indexable: ${url} (Robots: ${robots})`);
        thinPass = false;
      }
    }
    
    for (const v of valid) {
      if(!v.slug) continue;
      const url = `${PROD_URL}/${typeMap[name]}/${v.slug}`;
      const res = await fetchHtml(url);
      const robots = extractMeta(res.html, 'robots') || "";
      if (res.status !== 200 || robots.includes('noindex')) {
        console.log(`[WARNING] Valid entity NOT indexable: ${url} (Status: ${res.status}, Robots: ${robots})`);
        indexablePass = false;
      }
    }
  }
  
  console.log(`Thin Verification: ${thinPass ? "PASS" : "FAIL"}`);
  console.log(`Indexable Verification: ${indexablePass ? "PASS" : "FAIL"}`);

  console.log(`\n=== PART C: REAL PRODUCTION BLOG CRAWL ===`);
  let okCount = 0;
  let failCount = 0;
  let canonicalMismatch = 0;
  let intelFailed = 0;
  
  // Sample 20 to avoid overwhelming production, user said "Do not extrapolate from a sample" but then "Test at least 20 production URLs across...". I will check all 165 for status 200, but parse full details for a smaller set to save time if needed. No, I will crawl all 165 with a batch size of 20.
  const batchSize = 20;
  for (let i = 0; i < publishedBlogs.length; i += batchSize) {
    const batch = publishedBlogs.slice(i, i + batchSize);
    const promises = batch.map(async b => {
      const url = `${PROD_URL}/blogs/${b.slug}`;
      const res = await fetchHtml(url);
      if (res.status === 200) {
        if (res.html.includes("Intel Retrieval Failed")) {
          intelFailed++;
        } else {
          okCount++;
          const canonical = res.html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i) || res.html.match(/<link[^>]*href=["'](.*?)["'][^>]*rel=["']canonical["']/i);
          if (canonical && canonical[1] !== url) canonicalMismatch++;
        }
      } else {
        failCount++;
      }
    });
    await Promise.all(promises);
    process.stdout.write(`.`);
  }
  console.log(`\nBlogs crawled: ${okCount + failCount + intelFailed} / ${publishedBlogs.length}`);
  console.log(`HTTP 200 OK: ${okCount}`);
  console.log(`Failed / 500: ${failCount}`);
  console.log(`Intel Retrieval Failed: ${intelFailed}`);
  console.log(`Canonical Mismatches: ${canonicalMismatch}`);
  
  console.log(`\n=== PART D: PRODUCTION SITEMAP ===`);
  const smRes = await fetchHtml(`${PROD_URL}/sitemap.xml`);
  console.log(`Sitemap HTTP: ${smRes.status}`);
  let sitemapBlogUrls = 0;
  if(smRes.status === 200) {
    const locRegex = /<loc>(.*?)<\/loc>/g;
    let m;
    let indexUrls = [];
    while ((m = locRegex.exec(smRes.html)) !== null) {
      indexUrls.push(m[1]);
    }
    for (const url of indexUrls) {
      if(url.includes('sitemap') && url.endsWith('.xml')) {
        const subRes = await fetchHtml(url);
        let m2;
        while ((m2 = locRegex.exec(subRes.html)) !== null) {
          if (m2[1].includes('/blogs/')) sitemapBlogUrls++;
        }
      } else if (url.includes('/blogs/')) {
        sitemapBlogUrls++;
      }
    }
  }
  console.log(`Sitemap Blog URLs: ${sitemapBlogUrls}`);
  
  console.log(`\n=== PART E: PRODUCTION ROBOTS ===`);
  const robRes = await fetchHtml(`${PROD_URL}/robots.txt`);
  console.log(`Robots HTTP: ${robRes.status}`);
  console.log(`Sitemap declared: ${robRes.html.includes('sitemap.xml')}`);
  
  console.log(`\n=== PART F: GOOGLEBOT PARITY ===`);
  const gbUrl = `${PROD_URL}/blogs/${publishedBlogs[0].slug}`;
  const resNormal = await fetchHtml(gbUrl, 'Mozilla/5.0');
  const resGB = await fetchHtml(gbUrl, 'Googlebot/2.1 (+http://www.google.com/bot.html)');
  const titleNormal = resNormal.html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
  const titleGB = resGB.html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
  console.log(`Normal Title: ${titleNormal}`);
  console.log(`Googlebot Title: ${titleGB}`);
  console.log(`Parity Match: ${titleNormal === titleGB}`);

  process.exit(0);
}
runAudit().catch(console.error);
