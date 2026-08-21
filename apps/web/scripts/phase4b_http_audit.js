const http = require('http');
const https = require('https');

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ html: data, status: res.statusCode, headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.abort(); reject(new Error("Timeout")); });
  });
}

function extractMeta(html, name) {
  const match = html.match(new RegExp(`<meta(?:\\s+[^>]*?)?\\s+(?:name|property)=["']${name}["'](?:\\s+[^>]*?)?\\s+content=["'](.*?)["']`, 'i')) || 
                html.match(new RegExp(`<meta(?:\\s+[^>]*?)?\\s+content=["'](.*?)["'](?:\\s+[^>]*?)?\\s+(?:name|property)=["']${name}["']`, 'i'));
  return match ? match[1] : null;
}

async function audit() {
  console.log("Fetching sitemap...");
  let sitemapHtml;
  try {
    const res = await fetchHtml("http://localhost:3000/sitemap.xml");
    sitemapHtml = res.html;
  } catch(e) {
    console.error("Sitemap fetch failed", e);
    process.exit(1);
  }

  // Very rudimentary parse since Next.js returns a sitemap index sometimes
  let urls = [];
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let m;
  while ((m = locRegex.exec(sitemapHtml)) !== null) {
    urls.push(m[1]);
  }
  
  console.log(`Found ${urls.length} URLs in root sitemap.`);
  
  // If it's a sitemap index, fetch sub sitemaps
  if (sitemapHtml.includes('<sitemapindex')) {
    const subUrls = [];
    for (const u of urls) {
      if (u.includes('localhost:3000') || u.includes('globalchanakya.in')) {
        let fetchUrl = u.replace('https://www.globalchanakya.in', 'http://localhost:3000');
        try {
          const subRes = await fetchHtml(fetchUrl);
          let m2;
          while ((m2 = locRegex.exec(subRes.html)) !== null) {
             subUrls.push(m2[1]);
          }
        } catch(e) {}
      }
    }
    urls = subUrls;
  }
  
  const blogUrls = urls.filter(u => u.includes('/blogs/') && !u.endsWith('/blogs'));
  console.log(`Found ${blogUrls.length} Blog URLs in sitemap.`);
  
  const results = { total: blogUrls.length, ok: 0, fail: 0, noindex: 0, canonicalMissing: 0, h1Missing: 0, jsonldMissing: 0 };
  
  // Test a sample of 10 urls to avoid timeout
  const sampleUrls = blogUrls.slice(0, 10);
  for (const u of sampleUrls) {
    let fetchUrl = u.replace('https://www.globalchanakya.in', 'http://localhost:3000');
    try {
      const res = await fetchHtml(fetchUrl);
      if (res.status === 200) {
        results.ok++;
        const title = res.html.match(/<title[^>]*>(.*?)<\/title>/i);
        const h1 = res.html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        const canonical = res.html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i) || res.html.match(/<link[^>]*href=["'](.*?)["'][^>]*rel=["']canonical["']/i);
        const robots = extractMeta(res.html, 'robots');
        const jsonLd = res.html.includes('application/ld+json');
        
        if (robots && robots.includes('noindex')) results.noindex++;
        if (!canonical) results.canonicalMissing++;
        if (!h1) results.h1Missing++;
        if (!jsonLd) results.jsonldMissing++;
      } else {
        results.fail++;
      }
    } catch(e) {
      results.fail++;
    }
  }
  
  console.log("Sample 10 Audit Results:", results);
}

audit();
