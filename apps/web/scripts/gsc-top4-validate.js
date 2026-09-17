const http = require('http');

const SLUGS = [
  { name: 'Serbia-Kosovo', path: '/blogs/serbia-kosovo-tensions-explained-2026' },
  { name: 'Yemen', path: '/blogs/yemen-civil-war-strategic-importance-2026' },
  { name: 'Russia-Ukraine', path: '/blogs/russia-ukraine-war-timeline-strategic-analysis-2026' },
  { name: 'Suez Canal', path: '/blogs/suez-canal-2026-strategic-importance-global-trade-egypt' },
];

async function fetchPage(slug) {
  return new Promise((resolve, reject) => {
    // Add cache-control to force bypass
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path: slug,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    };
    http.get(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    }).on('error', reject);
  });
}

function extract(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : 'NOT FOUND';
}

async function run() {
  for (const s of SLUGS) {
    let res;
    try { res = await fetchPage(s.path); }
    catch (e) { console.log(s.name + ': FETCH ERROR'); continue; }
    const html = res.html;

    const titleTag = extract(html, /<title>([\s\S]*?)<\/title>/i);
    const h1 = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]*>/g, '').trim();
    const desc = extract(html, /<meta name="description" content="([^"]*?)"/i);
    const canonical = extract(html, /<link rel="canonical" href="([^"]*?)"/i);
    const robots = extract(html, /<meta name="robots" content="([^"]*?)"/i);
    const ogTitle = extract(html, /<meta property="og:title" content="([^"]*?)"/i);
    const ogImage = extract(html, /<meta property="og:image" content="([^"]*?)"/i);
    const hasPersonSchema = html.includes('"@type":"Person"') || html.includes('"@type": "Person"');
    const hasAuthorSchemaSh = html.includes('author-schema');
    const hasToc = html.includes('table-of-contents') || html.includes('Table of Contents');
    const hasTimeline = html.includes('Key Events Timeline') || html.includes('Chronological Timeline');
    const internalLinks = (html.match(/href="\/blogs\//g) || []).length;

    console.log('=== ' + s.name + ' ===');
    console.log('HTTP: ' + res.status);
    console.log('title: ' + titleTag.substring(0,80));
    console.log('h1: ' + h1.substring(0,80));
    console.log('desc: ' + desc.substring(0,100));
    console.log('canonical: ' + canonical);
    console.log('robots: ' + robots);
    console.log('og:title: ' + ogTitle.substring(0,80));
    console.log('og:image: ' + ogImage.substring(0,60));
    console.log('Person schema: ' + hasPersonSchema + ' | author-schema: ' + hasAuthorSchemaSh);
    console.log('Has ToC: ' + hasToc + ' | Has Timeline: ' + hasTimeline);
    console.log('Internal /blogs/ links: ' + internalLinks);
    console.log('');
  }
}
run().catch(console.error);
