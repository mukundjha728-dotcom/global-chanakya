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

async function runTest() {
  await mongoose.connect(process.env.MONGODB_URI);
  const allBlogs = await Blog.find({ status: 'published' }).select("slug").lean();
  let mismatches = [];
  
  const batchSize = 20;
  for (let i = 0; i < allBlogs.length; i += batchSize) {
    const batch = allBlogs.slice(i, i + batchSize);
    const promises = batch.map(async b => {
      const url = `${PROD_URL}/blogs/${b.slug}`;
      const res = await fetchHtml(url);
      if (res.status === 200) {
        const canonical = res.html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i) || res.html.match(/<link[^>]*href=["'](.*?)["'][^>]*rel=["']canonical["']/i);
        if (canonical && canonical[1] !== url) {
           mismatches.push(`${url} -> ${canonical[1]}`);
        }
      }
    });
    await Promise.all(promises);
  }
  console.log("Mismatches:");
  console.log(mismatches);
  process.exit(0);
}
runTest().catch(console.error);
