const mongoose = require("mongoose");
const fs = require('fs');
require("dotenv").config({ path: ".env.local" });

const BlogSchema = new mongoose.Schema({}, { strict: false, collection: 'blogs' });
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

const PROD_URL = "https://www.globalchanakya.in";

async function fetchHtml(url, ua = 'Mozilla/5.0') {
  const start = Date.now();
  try {
    const res = await fetch(url, { headers: { 'User-Agent': ua } });
    const text = await res.text();
    return { html: text, status: res.status, time: Date.now() - start, redirected: res.redirected, url: res.url };
  } catch(e) {
    return { html: '', status: 500, time: Date.now() - start, redirected: false, url };
  }
}

function extractMeta(html, name) {
  const match = html.match(new RegExp(`<meta(?:\\s+[^>]*?)?\\s+(?:name|property)=["']${name}["'](?:\\s+[^>]*?)?\\s+content=["'](.*?)["']`, 'i')) || 
                html.match(new RegExp(`<meta(?:\\s+[^>]*?)?\\s+content=["'](.*?)["'](?:\\s+[^>]*?)?\\s+(?:name|property)=["']${name}["']`, 'i'));
  return match ? match[1] : null;
}

async function runTest() {
  console.log(`\n=== PART A: THIN TAXONOMY VERIFICATION ===`);
  const thinEntities = [
    '/categories/diplomacy',
    '/topics/cyber-warfare',
    '/topics/ai-deepfakes',
    '/countries/australia',
    '/countries/syria',
    '/regions/latin-america',
    '/regions/arctic',
    '/leaders/kim-jong-un',
    '/leaders/joe-biden',
    '/conflicts/myanmar-crisis',
    '/organizations/opec'
  ];
  
  let p1Issues = [];
  for(const path of thinEntities) {
    const res = await fetchHtml(PROD_URL + path);
    const robots = extractMeta(res.html, 'robots') || "";
    if (res.status === 200 && !robots.includes('noindex')) {
      p1Issues.push(`${path} -> ${robots}`);
    }
  }
  if (p1Issues.length > 0) {
    console.log("[P1 ISSUE] The following thin entities are indexable:");
    p1Issues.forEach(u => console.log(u));
  } else {
    console.log("PASS: All thin entities return noindex.");
  }

  console.log(`\n=== PART B: INDEXABLE ENTITY VERIFICATION ===`);
  const validEntities = [
    '/categories/geopolitics',
    '/topics/energy-security',
    '/countries/india',
    '/regions/indo-pacific',
    '/leaders/xi-jinping',
    '/conflicts/south-china-sea',
    '/organizations/brics'
  ];
  let invalidIssues = [];
  for(const path of validEntities) {
    const res = await fetchHtml(PROD_URL + path);
    const robots = extractMeta(res.html, 'robots') || "";
    if (res.status !== 200 || robots.includes('noindex')) {
      invalidIssues.push(`${path} (Status: ${res.status}, Robots: ${robots})`);
    }
  }
  if (invalidIssues.length > 0) {
    console.log("[FAIL] The following valid entities are broken or noindex:");
    invalidIssues.forEach(u => console.log(u));
  } else {
    console.log("PASS: All sampled valid entities are indexable.");
  }

  console.log(`\n=== PART C: REAL PRODUCTION BLOG CRAWL ===`);
  await mongoose.connect(process.env.MONGODB_URI);
  const allBlogs = await Blog.find({}).select("slug status").lean();
  const publishedBlogs = allBlogs.filter(b => b.status === 'published');
  
  let okCount = 0;
  let noindexCount = 0;
  let canonicalMismatch = 0;
  let missingH1 = 0;
  let missingBlogPosting = 0;
  let missingBreadcrumb = 0;
  let missingOGTitle = 0;
  let missingOGDesc = 0;
  let missingOGImage = 0;
  let redirectChains = 0;
  let intelFailed = 0;
  let fails = [];
  
  const batchSize = 10;
  for (let i = 0; i < publishedBlogs.length; i += batchSize) {
    const batch = publishedBlogs.slice(i, i + batchSize);
    const promises = batch.map(async b => {
      const url = `${PROD_URL}/blogs/${b.slug}`;
      const res = await fetchHtml(url);
      if (res.status === 200) {
        if (res.html.includes("Intel Retrieval Failed")) intelFailed++;
        else {
          okCount++;
          if (res.redirected) redirectChains++;
          const robots = extractMeta(res.html, 'robots') || "";
          if (robots.includes('noindex')) noindexCount++;
          const canonical = res.html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i) || res.html.match(/<link[^>]*href=["'](.*?)["'][^>]*rel=["']canonical["']/i);
          if (canonical && canonical[1] !== url) canonicalMismatch++;
          if (!res.html.includes('<h1')) missingH1++;
          if (!res.html.includes('"@type":"BlogPosting"')) missingBlogPosting++;
          if (!res.html.includes('"@type":"BreadcrumbList"')) missingBreadcrumb++;
          if (!extractMeta(res.html, 'og:title')) missingOGTitle++;
          if (!extractMeta(res.html, 'og:description')) missingOGDesc++;
          if (!extractMeta(res.html, 'og:image')) missingOGImage++;
        }
      } else {
        fails.push(url + " " + res.status);
      }
    });
    await Promise.all(promises);
    process.stdout.write(`.`);
  }
  
  console.log(`\nCrawled: ${publishedBlogs.length}`);
  console.log(`HTTP 200 OK: ${okCount}`);
  if(fails.length > 0) console.log(`Fails: ${fails.join(', ')}`);
  console.log(`Intel Retrieval Failed: ${intelFailed}`);
  console.log(`Redirect Chains: ${redirectChains}`);
  console.log(`Accidental Noindex: ${noindexCount}`);
  console.log(`Canonical Mismatches: ${canonicalMismatch}`);
  console.log(`Missing H1: ${missingH1}`);
  console.log(`Missing BlogPosting: ${missingBlogPosting}`);
  console.log(`Missing BreadcrumbList: ${missingBreadcrumb}`);
  console.log(`Missing OG Title: ${missingOGTitle} | Desc: ${missingOGDesc} | Image: ${missingOGImage}`);
  
  console.log(`\n=== PART D: PRODUCTION SITEMAP ===`);
  const smRes = await fetchHtml(`${PROD_URL}/sitemap.xml`);
  console.log(`Sitemap HTTP: ${smRes.status}`);
  let sitemapBlogUrls = [];
  if(smRes.status === 200) {
    const locRegex = /<loc>(.*?)<\/loc>/g;
    let indexUrls = [];
    let m;
    while ((m = locRegex.exec(smRes.html)) !== null) indexUrls.push(m[1]);
    for (const url of indexUrls) {
      if(url.includes('sitemap') && url.endsWith('.xml')) {
        const subRes = await fetchHtml(url);
        let m2;
        while ((m2 = locRegex.exec(subRes.html)) !== null) {
          if (m2[1].includes('/blogs/')) sitemapBlogUrls.push(m2[1]);
        }
      } else if (url.includes('/blogs/')) {
        sitemapBlogUrls.push(url);
      }
    }
  }
  console.log(`Published DB Blogs: ${publishedBlogs.length}`);
  console.log(`Sitemap Blog URLs: ${sitemapBlogUrls.length}`);
  console.log(`Difference: ${Math.abs(publishedBlogs.length - sitemapBlogUrls.length)}`);

  console.log(`\n=== PART E: PRODUCTION ROBOTS ===`);
  const robRes = await fetchHtml(`${PROD_URL}/robots.txt`);
  console.log(`Robots HTTP: ${robRes.status}`);
  console.log(`Sitemap declared: ${robRes.html.includes('sitemap.xml')}`);
  
  console.log(`\n=== PART F: GOOGLEBOT PARITY ===`);
  const gbUrl = `${PROD_URL}/blogs/${publishedBlogs[0].slug}`;
  const resNormal = await fetchHtml(gbUrl, 'Mozilla/5.0');
  const resGB = await fetchHtml(gbUrl, 'Googlebot/2.1 (+http://www.google.com/bot.html)');
  const titleNormal = extractMeta(resNormal.html, 'og:title') || resNormal.html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
  const titleGB = extractMeta(resGB.html, 'og:title') || resGB.html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
  console.log(`Normal Title: ${titleNormal}`);
  console.log(`Googlebot Title: ${titleGB}`);
  console.log(`Parity Match: ${titleNormal === titleGB}`);

  console.log(`\n=== PART H: SENTRY & BHK ===`);
  const htmlSample = await fetchHtml(PROD_URL);
  console.log(`Sentry JS exists in HTML: ${htmlSample.html.includes('sentry')}`);
  console.log(`BHK JS exists in HTML: ${htmlSample.html.includes('bhk')}`);
  
  process.exit(0);
}
runTest().catch(console.error);
