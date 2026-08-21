const mongoose = require("mongoose");
const http = require('http');
const https = require('https');
require("dotenv").config({ path: ".env.local" });

const BlogSchema = new mongoose.Schema({}, { strict: false, collection: 'blogs' });
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

const PROD_URL = process.env.PROD_URL || "https://www.globalchanakya.in";

async function fetchHtml(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      let data = '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
         resolve({ html: '', status: res.statusCode, redirect: res.headers.location });
         return;
      }
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
  const blogs = await Blog.find({ status: 'published' }).lean();
  
  let mismatches = [];
  let ogIssues = [];

  const batchSize = 10;
  for (let i = 0; i < blogs.length; i += batchSize) {
    const batch = blogs.slice(i, i + batchSize);
    const promises = batch.map(async b => {
      const url = `${PROD_URL}/blogs/${b.slug}`;
      let res = await fetchHtml(url);
      let finalUrl = url;
      
      if (res.redirect) {
         finalUrl = new URL(res.redirect, PROD_URL).toString();
         res = await fetchHtml(finalUrl);
      }

      if (res.status === 200) {
        // Canonical Check
        const canonical = res.html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i) || res.html.match(/<link[^>]*href=["'](.*?)["'][^>]*rel=["']canonical["']/i);
        const renderedCanonical = canonical ? canonical[1] : null;
        const expectedCanonical = `https://www.globalchanakya.in/blogs/${encodeURIComponent(b.slug)}`;
        
        if (renderedCanonical !== expectedCanonical) {
           mismatches.push({
             _id: b._id,
             slug: b.slug,
             requestedUrl: url,
             status: res.status,
             finalUrl: finalUrl,
             renderedCanonical,
             expectedCanonical: expectedCanonical,
             hasWhitespace: /\s/.test(b.slug),
             hasPercent20: b.slug.includes('%20'),
             isLegacy: b.slug === "the-third-pole-india-s-bid-to-shape-the-emerging-multipolar-world-order" // From earlier logs
           });
        }
        
        // OG Image Check
        const ogImage = extractMeta(res.html, 'og:image');
        if (!ogImage) {
           ogIssues.push({
             slug: b.slug,
             sourceFeaturedImage: b.featuredImage?.url || null,
             sourceOgImage: b.ogImage?.url || null,
             generatedOgImage: ogImage,
             reason: "Missing in HTML"
           });
        } else {
           // Basic sanity check of OG Image
           try {
             const imgUrl = new URL(ogImage);
             if (imgUrl.hostname === 'gstatic.com' || imgUrl.hostname === 'www.gstatic.com') {
               ogIssues.push({
                 slug: b.slug,
                 sourceFeaturedImage: b.featuredImage?.url || null,
                 sourceOgImage: b.ogImage?.url || null,
                 generatedOgImage: ogImage,
                 reason: "gstatic.com (blocked)"
               });
             } else if (!ogImage.startsWith('http')) {
               ogIssues.push({
                 slug: b.slug,
                 sourceFeaturedImage: b.featuredImage?.url || null,
                 sourceOgImage: b.ogImage?.url || null,
                 generatedOgImage: ogImage,
                 reason: "Relative/Malformed URL"
               });
             }
           } catch(e) {
               ogIssues.push({
                 slug: b.slug,
                 sourceFeaturedImage: b.featuredImage?.url || null,
                 sourceOgImage: b.ogImage?.url || null,
                 generatedOgImage: ogImage,
                 reason: "Invalid URL Format"
               });
           }
        }
      } else {
         console.log("Failed to fetch", url, res.status);
      }
    });
    await Promise.all(promises);
    process.stdout.write('.');
  }
  
  console.log("\n\n=== CANONICAL MISMATCHES ===");
  console.log(JSON.stringify(mismatches, null, 2));
  
  console.log("\n=== OG IMAGE ISSUES (" + ogIssues.length + ") ===");
  console.log(JSON.stringify(ogIssues, null, 2));

  process.exit(0);
}
runAudit().catch(console.error);
