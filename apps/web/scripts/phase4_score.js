const data = require('/tmp/phase4_blogs.json');
const fs = require('fs');

function scoreArticle(b) {
  let tech = 8;
  if (b.slug && b.slug.length < 80) tech += 4;
  if (b.hasSeoTitle) tech += 2;
  if (b.hasSeoDesc) tech += 1;
  
  let onpage = 0;
  if (b.hasSeoTitle) onpage += 5;
  if (b.seoTitleLength >= 40 && b.seoTitleLength <= 65) onpage += 5;
  else if (b.seoTitleLength >= 30) onpage += 3;
  if (b.hasSeoDesc) onpage += 4;
  if (b.seoDescLength >= 100 && b.seoDescLength <= 160) onpage += 4;
  else if (b.seoDescLength < 100) onpage += 2;
  else onpage += 1;
  if (b.hasImage) onpage += 2;
  
  let intent = 0;
  const tl = (b.title || '').toLowerCase();
  if (/202[4-9]/.test(tl)) intent += 4;
  if (b.countriesCount > 0 || b.leadersCount > 0) intent += 5;
  if (/explain|analys|strateg|what is|how|why|inside|repor/.test(tl)) intent += 6;
  else intent += 2;
  
  let content = 3;
  if (b.contentLength > 40000) content += 12;
  else if (b.contentLength > 25000) content += 10;
  else if (b.contentLength > 15000) content += 7;
  if (b.hasFaq) content += 5;
  
  const entityCount = b.topicsCount + b.countriesCount + b.leadersCount + b.conflictsCount + b.orgsCount;
  let linking = 0;
  if (entityCount >= 4) linking = 10;
  else if (entityCount >= 2) linking = 6;
  else if (entityCount >= 1) linking = 3;
  
  let entity = 0;
  if (b.topicsCount > 0) entity += 2;
  if (b.countriesCount > 0) entity += 3;
  if (b.leadersCount > 0) entity += 2;
  if (b.conflictsCount > 0) entity += 2;
  if (b.orgsCount > 0) entity += 1;
  
  let freshness = 5;
  const daysOld = (new Date('2026-08-20') - new Date(b.publishAt)) / 86400000;
  if (daysOld > 180) freshness = 1;
  else if (daysOld > 90) freshness = 2;
  else if (daysOld > 30) freshness = 4;
  
  let ctr = 0;
  if (b.titleLength >= 40 && b.titleLength <= 65) ctr += 3;
  else if (b.titleLength >= 66 && b.titleLength <= 75) ctr += 2;
  if (/\d+/.test(b.title || '')) ctr += 2;
  
  return { tech, onpage, intent, content, linking, entity, freshness, ctr, total: tech+onpage+intent+content+linking+entity+freshness+ctr };
}

const header = 'slug,title,total_score,technical_seo,onpage_seo,search_intent,content_quality,internal_linking,entity_relevance,freshness,ctr_potential,content_length,title_length,has_image,has_faq,countries,leaders,topics,conflicts,orgs,views';
const rows = [header];
for (const b of data) {
  const s = scoreArticle(b);
  const t = (b.title||'').replace(/"/g, "'");
  rows.push([b.slug, '"'+t+'"', s.total, s.tech, s.onpage, s.intent, s.content, s.linking, s.entity, s.freshness, s.ctr, b.contentLength, b.titleLength, b.hasImage?'Y':'N', b.hasFaq?'Y':'N', b.countriesCount, b.leadersCount, b.topicsCount, b.conflictsCount, b.orgsCount, (b.analytics&&b.analytics.views)||0].join(','));
}
fs.writeFileSync('/tmp/phase4_article_scores.csv', rows.join('\n'));
console.log('Done, rows:', rows.length - 1);
