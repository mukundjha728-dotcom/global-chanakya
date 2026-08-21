const http = require('http');
const https = require('https');
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
    const url = PROD_URL + path;
    const res = await fetchHtml(url);
    const robots = extractMeta(res.html, 'robots') || "";
    if (res.status === 200 && !robots.includes('noindex')) {
      p1Issues.push(url);
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
    const url = PROD_URL + path;
    const res = await fetchHtml(url);
    const robots = extractMeta(res.html, 'robots') || "";
    if (res.status !== 200 || robots.includes('noindex')) {
      invalidIssues.push(`${url} (Status: ${res.status}, Robots: ${robots})`);
    }
  }
  if (invalidIssues.length > 0) {
    console.log("[FAIL] The following valid entities are broken or noindex:");
    invalidIssues.forEach(u => console.log(u));
  } else {
    console.log("PASS: All sampled valid entities are indexable.");
  }

  console.log(`\n=== PART F: GOOGLEBOT PARITY ===`);
  const gbUrl = `${PROD_URL}/blogs/india-growth-defence-geopolitics-before-after-2014`;
  const resNormal = await fetchHtml(gbUrl, 'Mozilla/5.0');
  const resGB = await fetchHtml(gbUrl, 'Googlebot/2.1 (+http://www.google.com/bot.html)');
  const titleNormal = resNormal.html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
  const titleGB = resGB.html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
  console.log(`Normal Title: ${titleNormal}`);
  console.log(`Googlebot Title: ${titleGB}`);
  console.log(`Parity Match: ${titleNormal === titleGB}`);

  // Fetch Sitemap
  console.log(`\n=== PART D: PRODUCTION SITEMAP ===`);
  const smRes = await fetchHtml(`${PROD_URL}/sitemap.xml`);
  console.log(`Sitemap HTTP: ${smRes.status}`);
  let smContent = smRes.html;
  let thinInSitemap = thinEntities.filter(t => smContent.includes(t));
  if (thinInSitemap.length > 0) {
    console.log("[P1 ISSUE] Thin entities found in sitemap:");
    console.log(thinInSitemap);
  } else {
    console.log("PASS: Thin entities are correctly excluded from sitemap.");
  }
}

runTest().catch(console.error);
