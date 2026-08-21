const http = require('http');
const https = require('https');
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const BlogSchema = new mongoose.Schema({}, { strict: false, collection: 'blogs' });
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

const PROD_URL = "https://www.globalchanakya.in";

async function fetchHtml(url, ua = 'Mozilla/5.0') {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': ua } }, (res) => {
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

async function runTest() {
  await mongoose.connect(process.env.MONGODB_URI);
  const allBlogs = await Blog.find({ status: 'published' }).select("slug").limit(9).lean();
  
  let urls = [
    '/blogs/india-growth-defence-geopolitics-before-after-2014'
  ];
  urls.push(...allBlogs.map(b => '/blogs/' + b.slug));

  let passed = 0;
  for(const path of urls) {
    const url = PROD_URL + path;
    const res = await fetchHtml(url);
    if(res.status === 200) {
      if(res.html.includes("Intel Retrieval Failed") || res.html.includes("MissingSchemaError")) {
        console.log(`[FAIL] ${path} returned Intel Retrieval Failed`);
      } else {
        const robots = extractMeta(res.html, 'robots') || "";
        const h1 = res.html.includes('<h1');
        const blogposting = res.html.includes('"@type":"BlogPosting"');
        const breadcrumb = res.html.includes('"@type":"BreadcrumbList"');
        const canonical = res.html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i) || res.html.match(/<link[^>]*href=["'](.*?)["'][^>]*rel=["']canonical["']/i);
        
        if (robots.includes('noindex')) {
          console.log(`[FAIL] ${path} is noindex`);
        } else if (canonical && canonical[1] !== url) {
          console.log(`[FAIL] ${path} canonical mismatch`);
        } else if (!h1 || !blogposting || !breadcrumb) {
          console.log(`[FAIL] ${path} missing structure`);
        } else {
          passed++;
        }
      }
    } else {
      console.log(`[FAIL] ${path} returned ${res.status}`);
    }
  }
  
  if (passed === 10) {
    console.log("SMOKE TEST PASS");
  } else {
    console.log(`SMOKE TEST FAIL: ${passed}/10 passed`);
  }
  process.exit(0);
}
runTest().catch(console.error);
