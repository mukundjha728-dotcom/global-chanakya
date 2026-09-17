const http = require('http');
const fs = require('fs');

const TARGETS = [
  { slug: 'serbia-kosovo-tensions-explained-2026' },
  { slug: 'yemen-civil-war-strategic-importance-2026' },
  { slug: 'russia-ukraine-war-timeline-strategic-analysis-2026' },
  { slug: 'suez-canal-2026-strategic-importance-global-trade-egypt' },
];

const SOURCES = [
  { slug: 'hormuz-black-sea-chokepoints-iran-ukraine-oil-food-weaponization', target: 'yemen-civil-war-strategic-importance-2026' },
  { slug: 'yemen-ukraine-convergence-drone-war-distant-fronts-2026', target: 'yemen-civil-war-strategic-importance-2026' },
  { slug: 'hormuz-black-sea-chokepoints-iran-ukraine-oil-food-weaponization', target: 'suez-canal-2026-strategic-importance-global-trade-egypt' },
  { slug: 'caspian-convergence-ukraine-iran-wars', target: 'serbia-kosovo-tensions-explained-2026' },
  { slug: 'azerbaijan-geopolitical-leverage-aliyev-russia-iran-west', target: 'russia-ukraine-war-timeline-strategic-analysis-2026' },
  { slug: 'north-korea-missiles-russia-ukraine-proof', target: 'russia-ukraine-war-timeline-strategic-analysis-2026' },
];

async function fetchPage(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path: path,
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
  return m ? m[1].trim() : null;
}

function extractAll(html, re) {
  const m = [...html.matchAll(re)];
  return m.map(match => match[1].trim());
}

async function run() {
  const report = {
    targets: {},
    links: [],
    sitemap: {}
  };

  // 1. Target Articles
  for (const t of TARGETS) {
    const path = `/blogs/${t.slug}`;
    const res = await fetchPage(path);
    const html = res.html;

    const title = extract(html, /<title>([\s\S]*?)<\/title>/i);
    // Find all H1 tags to check for exactly one
    const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
    const h1s = h1Matches.map(m => m[1].replace(/<[^>]*>/g, '').trim());
    const desc = extract(html, /<meta name="description" content="([^"]*?)"/i);
    const canonical = extract(html, /<link rel="canonical" href="([^"]*?)"/i);
    const canonicals = extractAll(html, /<link rel="canonical" href="([^"]*?)"/ig);
    const robots = extract(html, /<meta name="robots" content="([^"]*?)"/i);
    
    // JSON-LD scripts
    const jsonLdBlocks = extractAll(html, /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/ig);
    const hasArticleSchema = jsonLdBlocks.some(b => b.includes('"@type":"Article"') || b.includes('"@type": "Article"'));
    const hasPersonSchema = jsonLdBlocks.some(b => b.includes('"@type":"Person"') || b.includes('"@type": "Person"'));
    
    const publishDateMatch = html.match(/"datePublished"\s*:\s*"([^"]+)"/i);
    const modifiedDateMatch = html.match(/"dateModified"\s*:\s*"([^"]+)"/i);

    const hasTimeline = html.includes('Key Events Timeline') || html.includes('Chronological Timeline');
    const hasToC = html.includes('table-of-contents') || html.includes('Table of Contents');

    report.targets[t.slug] = {
      status: res.status,
      title,
      h1Count: h1s.length,
      h1s,
      desc,
      canonical,
      canonicalCount: canonicals.length,
      robots,
      hasArticleSchema,
      hasPersonSchema,
      publishDate: publishDateMatch ? publishDateMatch[1] : null,
      modifiedDate: modifiedDateMatch ? modifiedDateMatch[1] : null,
      hasTimeline,
      hasToC
    };
  }

  // 2. Links
  for (const s of SOURCES) {
    const path = `/blogs/${s.slug}`;
    const res = await fetchPage(path);
    const html = res.html;
    
    // Find anchor tag for target
    // The match gets the surrounding paragraph for context
    // It's encoded as <p> in SSR if not decoded, but the raw HTML will have <p>
    const re = new RegExp(`([^>]*?<a[^>]*href="/blogs/${s.target}"[^>]*>[^<]*</a>[^<]*)`, 'gi');
    const match = html.match(re);
    
    let linkStatus = 'NOT_FOUND';
    let anchorText = null;
    let context = null;

    if (match && match.length > 0) {
      context = match[0].trim();
      const aMatch = context.match(/<a[^>]*href="\/blogs\/[^"]+"[^>]*>([^<]*)<\/a>/i);
      if (aMatch) {
        anchorText = aMatch[1];
        linkStatus = 'FOUND';
      }
    }

    report.links.push({
      source: s.slug,
      target: s.target,
      httpStatus: res.status,
      linkFound: linkStatus === 'FOUND',
      anchorText,
      contextSnippet: context
    });
  }

  // 3. Sitemap Check
  const smRes = await fetchPage('/sitemap.xml'); // Note: it's actually an index or redirect.
  // Next.js app router sitemap usually at /sitemap.xml which might redirect to /sitemap/xyz.xml
  // Let's check /sitemap/blogs.xml or similar if it exists, but we'll fetch /sitemap.xml first.
  let sitemapRaw = smRes.html;
  report.sitemap.rawResponse = sitemapRaw.substring(0, 500); // Check what's here

  // If it's a sitemap index, we may need to fetch the child sitemaps, but for now let's just save
  fs.writeFileSync('scripts/gsc-top4-verification-raw.json', JSON.stringify(report, null, 2));
  console.log('Verification completed. Wrote scripts/gsc-top4-verification-raw.json');
}

run().catch(console.error);
