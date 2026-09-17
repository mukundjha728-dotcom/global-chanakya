import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Retry the 4 skipped links with HTML-aware case-insensitive matching
const RETRY_LINKS = [
  {
    sourceSlug: 'hormuz-black-sea-chokepoints-iran-ukraine-oil-food-weaponization',
    targetSlug: 'yemen-civil-war-strategic-importance-2026',
    anchorText: "Yemen's strategic role in the Red Sea crisis",
    insertSentence: ' For a comprehensive analysis of how Yemen\'s Houthi forces are reshaping Red Sea trade routes, see our full report on <a href="/blogs/yemen-civil-war-strategic-importance-2026">Yemen\'s strategic role in the Red Sea crisis</a>.',
    contexts: ['Red Sea', 'Bab al-Mandab', 'shipping', 'Houthi', 'Yemen'],
  },
  {
    sourceSlug: 'yemen-ukraine-convergence-drone-war-distant-fronts-2026',
    targetSlug: 'yemen-civil-war-strategic-importance-2026',
    anchorText: 'Yemen Civil War 2026 analysis',
    insertSentence: ' Read our full <a href="/blogs/yemen-civil-war-strategic-importance-2026">Yemen Civil War 2026 analysis</a> for the complete strategic picture.',
    contexts: ['Houthi', 'Yemen', 'Red Sea', 'Ansar Allah'],
  },
  {
    sourceSlug: 'hormuz-black-sea-chokepoints-iran-ukraine-oil-food-weaponization',
    targetSlug: 'suez-canal-2026-strategic-importance-global-trade-egypt',
    anchorText: "Suez Canal's strategic importance in 2026",
    insertSentence: ' See our deep-dive on the <a href="/blogs/suez-canal-2026-strategic-importance-global-trade-egypt">Suez Canal\'s strategic importance in 2026</a> for Egypt\'s revenue and rerouting impacts.',
    contexts: ['Suez', 'Egypt', 'canal', 'chokepoint', 'maritime'],
  },
  {
    sourceSlug: 'caspian-convergence-ukraine-iran-wars',
    targetSlug: 'serbia-kosovo-tensions-explained-2026',
    anchorText: "Serbia-Kosovo tensions and Russia's role in 2026",
    insertSentence: ' Russia\'s influence extends beyond Ukraine — for analysis of how Moscow is shaping the Balkans, see our report on <a href="/blogs/serbia-kosovo-tensions-explained-2026">Serbia-Kosovo tensions and Russia\'s role in 2026</a>.',
    contexts: ['Russia', 'Moscow', 'Balkans', 'European security', 'NATO'],
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;

  for (const link of RETRY_LINKS) {
    const doc = await db.collection('blogs').findOne({ slug: link.sourceSlug }) as any;
    if (!doc) { console.log(`NOT FOUND: ${link.sourceSlug}`); continue; }

    const content: string = doc.content || '';

    if (content.includes(`/blogs/${link.targetSlug}`)) {
      console.log(`ALREADY LINKED: ${link.sourceSlug} → ${link.targetSlug}`);
      continue;
    }

    // Find first <p> that contains any of the context terms (case-insensitive HTML content)
    const pRe = /<p>([\s\S]*?)<\/p>/gi;
    let inserted = false;
    let updatedContent = content;
    const contextsLower = link.contexts.map(c => c.toLowerCase());

    updatedContent = content.replace(pRe, (match: string, pContent: string) => {
      if (!inserted) {
        const pLower = pContent.toLowerCase().replace(/<[^>]*>/g, ' '); // strip inner tags for matching
        const hasContext = contextsLower.some(c => pLower.includes(c));
        if (hasContext) {
          inserted = true;
          return `<p>${pContent.trimEnd()}${link.insertSentence}</p>`;
        }
      }
      return match;
    });

    if (!inserted) {
      // Last resort: append to end of first paragraph
      const firstP = content.match(/<p>([\s\S]*?)<\/p>/i);
      if (firstP) {
        updatedContent = content.replace(firstP[0], `<p>${firstP[1].trimEnd()}${link.insertSentence}</p>`);
        inserted = true;
        console.log(`  FALLBACK (first para): ${link.sourceSlug} → ${link.targetSlug}`);
      }
    }

    if (!inserted) {
      console.log(`  SKIP (no context or para found): ${link.sourceSlug}`);
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
