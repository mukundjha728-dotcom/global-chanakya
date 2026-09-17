const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'gsc-top5-forensic.json'), 'utf8'));

for (const [key, article] of Object.entries(data)) {
  if (!article) {
    console.log('\n=== ' + key + ' ===\nNOT FOUND!');
    continue;
  }

  const content = article.content || '';
  const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).length;

  const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : 'MISSING';

  const headings = [];
  const headingRe = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = headingRe.exec(content)) !== null) {
    headings.push('H' + m[1] + ': ' + m[2].replace(/<[^>]*>/g, '').trim());
  }

  const internalLinks = (content.match(/href="\/blog/g) || []).length;
  const hasConclusion = /conclusion|final strategic|intelligence forecast/i.test(content);
  const hasTable = /<table/i.test(content);
  const hasToc = /table of contents|toc/i.test(content);
  const ogImage = article.featuredImage || 'MISSING';

  console.log('\n=== ' + key + ' ===');
  console.log('Slug: ' + article.slug);
  console.log('Title (DB): ' + article.title);
  console.log('Status: ' + article.status + ' | Category: ' + article.category);
  console.log('Published: ' + article.publishDate + ' | Updated: ' + article.updatedDate);
  console.log('SEO Title: ' + (article.seo && article.seo.title ? article.seo.title : 'None'));
  console.log('SEO Desc: ' + (article.seo && article.seo.description ? article.seo.description : 'None'));
  console.log('H1 (in content): ' + h1);
  console.log('H1 vs Title match: ' + (h1 === article.title ? 'EXACT MATCH' : 'DIFFERS'));
  console.log('OG Image: ' + ogImage.substring(0, 80));
  console.log('Word Count: ~' + wordCount);
  console.log('Headings (' + headings.length + '): ' + headings.slice(0, 8).join(' | '));
  console.log('Has ToC: ' + hasToc + ' | Has Table: ' + hasTable + ' | Has Conclusion: ' + hasConclusion);
  console.log('Internal links (href=/blog*): ' + internalLinks);
  console.log('Inbound DB (relatedArticles): ' + article.inboundRelatedCount);
  console.log('Contextual Inbound (slug in others): ' + article.contextualInboundCount);
  console.log('Related Articles Outbound: ' + article.relatedArticlesCount);
  console.log('Entities - Topics:' + (article.topics ? article.topics.length : 0) +
    ' Countries:' + (article.countries ? article.countries.length : 0) +
    ' Regions:' + (article.regions ? article.regions.length : 0) +
    ' Leaders:' + (article.leaders ? article.leaders.length : 0) +
    ' Conflicts:' + (article.conflicts ? article.conflicts.length : 0));
}
