import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// These source articles store content as HTML-entity-encoded strings
// e.g. &lt;p&gt; instead of <p>
// We need to match on decoded text but insert encoded links

const LINKS = [
  {
    sourceSlug: 'hormuz-black-sea-chokepoints-iran-ukraine-oil-food-weaponization',
    targetSlug: 'yemen-civil-war-strategic-importance-2026',
    anchorText: "Yemen's strategic role in the Red Sea crisis",
    insertSentence: ' For a comprehensive analysis of how Yemen\'s Houthi forces are reshaping Red Sea trade routes, see our full report on &lt;a href="/blogs/yemen-civil-war-strategic-importance-2026"&gt;Yemen\'s strategic role in the Red Sea crisis&lt;/a&gt;.',
    contexts: ['Red Sea', 'Houthi', 'Bab al-Mandab', 'Yemen', 'shipping'],
    checkStr: 'yemen-civil-war-strategic-importance-2026',
  },
  {
    sourceSlug: 'yemen-ukraine-convergence-drone-war-distant-fronts-2026',
    targetSlug: 'yemen-civil-war-strategic-importance-2026',
    anchorText: 'Yemen Civil War 2026 analysis',
    insertSentence: ' Read our full &lt;a href="/blogs/yemen-civil-war-strategic-importance-2026"&gt;Yemen Civil War 2026 analysis&lt;/a&gt; for the complete strategic picture.',
    contexts: ['Houthi', 'Yemen', 'Red Sea', 'Ansar Allah', 'civil war'],
    checkStr: 'yemen-civil-war-strategic-importance-2026',
  },
  {
    sourceSlug: 'hormuz-black-sea-chokepoints-iran-ukraine-oil-food-weaponization',
    targetSlug: 'suez-canal-2026-strategic-importance-global-trade-egypt',
    anchorText: "Suez Canal's strategic importance in 2026",
    insertSentence: ' See our deep-dive on the &lt;a href="/blogs/suez-canal-2026-strategic-importance-global-trade-egypt"&gt;Suez Canal\'s strategic importance in 2026&lt;/a&gt; for Egypt\'s revenue and rerouting impacts.',
    contexts: ['Suez', 'Egypt', 'canal', 'maritime', 'chokepoint'],
    checkStr: 'suez-canal-2026-strategic-importance-global-trade-egypt',
  },
  {
    sourceSlug: 'caspian-convergence-ukraine-iran-wars',
    targetSlug: 'serbia-kosovo-tensions-explained-2026',
    anchorText: "Serbia-Kosovo tensions and Russia's role in 2026",
    insertSentence: ' Russia\'s influence extends beyond Ukraine — for analysis of how Moscow is shaping the Balkans, see our report on &lt;a href="/blogs/serbia-kosovo-tensions-explained-2026"&gt;Serbia-Kosovo tensions and Russia\'s role in 2026&lt;/a&gt;.',
    contexts: ['Russia', 'Moscow', 'NATO', 'Ukraine', 'European'],
    checkStr: 'serbia-kosovo-tensions-explained-2026',
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;

  for (const link of LINKS) {
    const doc: any = await db.collection('blogs').findOne({ slug: link.sourceSlug });
    if (!doc) { console.log(`NOT FOUND: ${link.sourceSlug}`); continue; }

    const content: string = doc.content || '';

    if (content.includes(link.checkStr)) {
      console.log(`ALREADY LINKED: ${link.sourceSlug} → ${link.targetSlug}`);
      continue;
    }

    // Content is entity-encoded: &lt;p&gt;...&lt;/p&gt;
    // Match encoded paragraph tags
    const pRe = /&lt;p&gt;([\s\S]*?)&lt;\/p&gt;/gi;
    let inserted = false;
    let updatedContent = content;
    const contextsLower = link.contexts.map(c => c.toLowerCase());

    updatedContent = content.replace(pRe, (match: string, pContent: string) => {
      if (!inserted) {
        const pLower = pContent.toLowerCase().replace(/&lt;[^&]*&gt;/g, ' '); // strip encoded tags
        const hasContext = contextsLower.some(c => pLower.includes(c));
        if (hasContext) {
          inserted = true;
          return `&lt;p&gt;${pContent.trimEnd()}${link.insertSentence}&lt;/p&gt;`;
        }
      }
      return match;
    });

    if (!inserted) {
      console.log(`  SKIP (no context found): ${link.sourceSlug} — tried: ${link.contexts.join(', ')}`);
      // Show first 500 chars to debug
      console.log('  first 500:', content.substring(0, 500));
      continue;
    }

    const result = await db.collection('blogs').updateOne(
      { slug: link.sourceSlug },
      { $set: { content: updatedContent } }
    );
    console.log(`  Added link: ${link.sourceSlug} → ${link.targetSlug} | modified: ${result.modifiedCount}`);
  }

  console.log('Done.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
