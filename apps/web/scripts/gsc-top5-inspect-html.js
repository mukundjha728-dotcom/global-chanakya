const http = require('http');

const SLUGS = [
  { name: 'Serbia-Kosovo', path: '/blogs/serbia-kosovo-tensions-explained-2026' },
  { name: 'Yemen', path: '/blogs/yemen-civil-war-strategic-importance-2026' },
  { name: 'Russia-Ukraine', path: '/blogs/russia-ukraine-war-timeline-strategic-analysis-2026' },
  { name: 'Suez Canal', path: '/blogs/suez-canal-2026-strategic-importance-global-trade-egypt' },
  { name: 'Syria', path: '/blogs/syria-conflict-current-power-map-2026' },
];

async function fetchPage(slug) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + slug, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, html: data, headers: res.headers }));
    }).on('error', reject);
  });
}

function extractTag(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : 'NOT FOUND';
}

async function run() {
  console.log('Inspecting live server HTML for 5 target pages...\n');

  for (const s of SLUGS) {
    let res;
    try {
      res = await fetchPage(s.path);
    } catch (e) {
      console.log(s.name + ': FETCH ERROR - ' + e.message);
      continue;
    }

    const html = res.html;

    const titleTag = extractTag(html, /<title>([\s\S]*?)<\/title>/i);
    const h1 = extractTag(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]*>/g, '').trim();
    const desc = extractTag(html, /<meta name="description" content="([^"]*?)"/i);
    const canonical = extractTag(html, /<link rel="canonical" href="([^"]*?)"/i);
    const robots = extractTag(html, /<meta name="robots" content="([^"]*?)"/i);
    const ogTitle = extractTag(html, /<meta property="og:title" content="([^"]*?)"/i);
    const ogDesc = extractTag(html, /<meta property="og:description" content="([^"]*?)"/i);
    const ogImage = extractTag(html, /<meta property="og:image" content="([^"]*?)"/i);
    const hasJsonLd = /<script type="application\/ld\+json"/.test(html);
    const noindex = /noindex/i.test(robots);
    const hasArticleSchema = html.includes('"@type":"Article"') || html.includes('"@type": "Article"');
    const hasAuthorSchema = html.includes('"@type":"Person"') || html.includes('"@type": "Person"');
    const internalLinkCount = (html.match(/href="\/blogs\//g) || []).length;

    console.log('=== ' + s.name + ' (' + s.path + ') ===');
    console.log('HTTP Status: ' + res.status);
    console.log('<title>: ' + titleTag);
    console.log('<h1>: ' + h1);
    console.log('title == h1: ' + (titleTag === h1 ? 'MATCH' : 'DIFFERS'));
    console.log('meta description: ' + desc);
    console.log('canonical: ' + canonical);
    console.log('robots: ' + robots + ' | noindex: ' + noindex);
    console.log('og:title: ' + ogTitle);
    console.log('og:description: ' + ogDesc.substring(0, 100));
    console.log('og:image: ' + ogImage.substring(0, 80));
    console.log('JSON-LD: ' + hasJsonLd + ' | Article schema: ' + hasArticleSchema + ' | Author schema: ' + hasAuthorSchema);
    console.log('Internal /blogs/ links: ' + internalLinkCount);
    console.log('');
  }
}

run().catch(console.error);
