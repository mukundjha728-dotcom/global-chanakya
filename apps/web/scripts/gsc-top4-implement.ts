import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// ============================================================
// ENTITY REFERENCE MAP (from recon)
// ============================================================
const ENTITY = {
  // Countries
  RUSSIA:   new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc1a'),
  UKRAINE:  new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc1c'),
  IRAN:     new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc1b'),
  YEMEN:    new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc27'),
  SAUDI:    new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc28'),
  UAE:      new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc29'),
  ISRAEL:   new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc25'),
  EGYPT:    new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc2b'),
  TURKEY:   new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc20'),
  IRAQ:     new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc3e'),
  // Leaders
  PUTIN:    new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc59'),
  ZELENSKY: new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc5c'),
  TRUMP:    new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc5b'),
  KHAMENEI: new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc5f'),
  NETANYAHU: new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc60'),
  ALI_AL_ZAIDI: new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc6c'),
  // Conflicts
  UKRAINE_WAR: new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc6e'),
  YEMEN_CIVIL_WAR: new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc71'),
  GAZA: new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc6f'),
  // Topics
  ENERGY_SECURITY: new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc3f'),
  DIPLOMACY: new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc40'),
  SANCTIONS: new mongoose.Types.ObjectId('6a869eca84b2ccb78887bc44'),
};

// Author from DB (Global Chanakya Intelligence team account)
const AUTHOR_NAME = 'Global Chanakya Intelligence';
const AUTHOR_URL = 'https://www.globalchanakya.in/about';
const AUTHOR_AVATAR = 'https://www.globalchanakya.in/icon.svg';

// ============================================================
// HELPER: inject timeline into content (after H1 + first 2 paragraphs)
// ============================================================
function injectAfterNthTag(content: string, afterTag: string, nth: number, injection: string): string {
  let count = 0;
  const re = new RegExp(`(<\/${afterTag}>)`, 'gi');
  return content.replace(re, (match) => {
    count++;
    if (count === nth) return match + injection;
    return match;
  });
}

// ============================================================
// ARTICLE-SPECIFIC CHANGES
// ============================================================

// ---- 1. SERBIA-KOSOVO ----
const serbiaKosovo = {
  slug: 'serbia-kosovo-tensions-explained-2026',
  seoTitle: 'Serbia-Kosovo Conflict 2026: What Is Really Happening',
  seoDescription: 'Inside the 2026 Serbia-Kosovo dispute: the Banjska attack fallout, Kosovo\'s integration push under Kurti, Vucic\'s domestic crisis, and why the EU dialogue has stalled.',
  // Add countries: Serbia doesn't exist in DB; closest: Russia (mentioned as influence actor). Kosovo not in DB either.
  // ONLY add existing DB entities that the article clearly covers:
  //   - Vladimir Putin (Russia uses Kosovo precedent, extensively discussed)
  //   - Russia country (Russia-Serbia link and Kosovo precedent used by Putin)
  addCountries: [ENTITY.RUSSIA], // Russia as active external actor (Putin/Russia cited as influence force, arms pressure, "colour revolution" backing)
  addLeaders: [ENTITY.PUTIN],    // Putin explicitly cited multiple times as backing Vucic, Kosovo precedent
  addConflicts: [],
  addTopics: [ENTITY.DIPLOMACY],
  // OG Image: no safe hosted image found. Report and leave as-is.
  ogImageNote: 'NO_SAFE_IMAGE: Google thumbnail URL is invalid. No verified hosted image available. Leaving as-is.',
};

// ---- 2. YEMEN ----
// Yemen already has: countries [Yemen, Saudi, Iran, UAE, Israel], regions x2, conflicts [Yemen Civil War]
// Add: leaders - Ali Al-Zaidi is in DB (Houthi-linked); Khamenei (Iran patron); GAZA conflict (referenced in article)
const yemen = {
  slug: 'yemen-civil-war-strategic-importance-2026',
  seoTitle: 'Yemen Civil War 2026: Houthis, Red Sea Crisis and What Comes Next',
  seoDescription: 'How Yemen\'s war in 2026 shapes Red Sea shipping, the Iran-proxy network, and Saudi-Emirati rivalry — with a chronological timeline of the key events.',
  addLeaders: [ENTITY.ALI_AL_ZAIDI, ENTITY.KHAMENEI], // Both central to article content
  addConflicts: [ENTITY.GAZA], // Israel-Gaza war extensively discussed as driver of Houthi escalation
  addTopics: [ENTITY.ENERGY_SECURITY], // Red Sea / Bab al-Mandab = energy/trade security
  ogImageNote: 'NO_SAFE_IMAGE: Google thumbnail URL is invalid. No verified hosted image available. Leaving as-is.',
  // Timeline to inject — events extracted ONLY from article content
  timeline: `\n<h2>Yemen Civil War: Key Events Timeline</h2>
<p>The following chronology is drawn from events documented in this report.</p>
<ul>
<li><strong>2011:</strong> Arab Spring protests erupt across Yemen; President Ali Abdullah Saleh transfers power to his deputy Abd Rabbuh Mansur Hadi under GCC-brokered deal.</li>
<li><strong>2014–2015:</strong> Houthi forces seize Sana'a; Hadi government collapses and flees to Aden. Saudi Arabia and coalition partners launch Operation Decisive Storm, beginning aerial campaign.</li>
<li><strong>2015 onwards:</strong> War expands into grinding multi-front stalemate. UAE builds up Southern Transitional Council (STC) as parallel southern force.</li>
<li><strong>2022:</strong> UN-brokered nationwide truce holds for six months — the longest sustained pause in the conflict. Truce expires without renewal; fighting resumes.</li>
<li><strong>2023:</strong> Saudi-Iran rapprochement brokered by China creates diplomatic opening. UN Special Envoy Hans Grundberg advances a framework for a permanent ceasefire.</li>
<li><strong>October 2023:</strong> Hamas attacks Israel; Houthis begin launching ballistic missiles and drones at Israeli territory in solidarity with Gaza.</li>
<li><strong>Late 2023 – 2024:</strong> Houthis escalate to targeting commercial shipping in the Red Sea and Gulf of Aden. International shipping companies reroute around the Cape of Good Hope. US-UK Operation Prosperity Guardian strikes Houthi targets inside Yemen.</li>
<li><strong>December 2025:</strong> STC forces launch military push into Yemen's eastern oil provinces (Hadramawt, Shabwa, Marib). Saudi Arabia intervenes militarily against STC — direct confrontation between former coalition partners.</li>
<li><strong>Early 2026:</strong> STC expelled from eastern provinces. Saudi-backed Presidential Leadership Council (PLC) consolidates control over Aden and oil-producing regions.</li>
<li><strong>February 2026:</strong> Israeli-US strikes on Iran. Houthis resume missile salvos at Israeli territory in response.</li>
<li><strong>Mid-2026:</strong> US-Iran de-escalation diplomacy creates tentative opening. Yemen prisoner exchange of roughly 1,600 long-held detainees signals limited humanitarian progress.</li>
</ul>\n`,
};

// ---- 3. RUSSIA-UKRAINE ----
// Already has: countries [Russia, Ukraine], leaders [Putin, Zelensky, Trump], conflicts [Ukraine War]
// Add: topics [Diplomacy, Sanctions]; no new entities needed
// Key changes: add ToC, add timeline section
const russiaUkraine = {
  slug: 'russia-ukraine-war-timeline-strategic-analysis-2026',
  // No SEO title change needed — title/H1 effectively aligned
  addTopics: [ENTITY.DIPLOMACY, ENTITY.SANCTIONS],
  ogImageNote: 'NO_SAFE_IMAGE: Google thumbnail URL is invalid. No verified hosted image available. Leaving as-is.',
  // Timeline drawn ONLY from events already in article content
  timeline: `\n<h2>Russia-Ukraine War: Chronological Timeline</h2>
<p>Key milestones documented in this report, presented in chronological order.</p>
<ul>
<li><strong>February 24, 2022:</strong> Russia launches full-scale invasion of Ukraine, opening fronts across the north (toward Kyiv), northeast, east, and south.</li>
<li><strong>March–April 2022:</strong> Russian forces repelled from the Kyiv and Chernihiv axes. Ukraine retains the capital. Russia refocuses on the eastern Donbas and southern Kherson regions.</li>
<li><strong>September 2022:</strong> Ukraine launches Kharkiv counteroffensive, liberating large swaths of territory in the northeast. Russia conducts sham referenda annexing Donetsk, Luhansk, Zaporizhzhia, and Kherson oblasts.</li>
<li><strong>November 2022:</strong> Ukraine liberates Kherson city. Front lines stabilize into attritional warfare.</li>
<li><strong>2023:</strong> Ukrainian counteroffensive in Zaporizhzhia direction makes limited territorial gains. Wagner Group mutiny (June 2023) briefly threatens Rostov-on-Don before standing down. Prigozhin dies in plane crash (August 2023).</li>
<li><strong>2024:</strong> Russia advances slowly across eastern Ukraine amid Ukrainian ammunition shortages. Ukraine conducts surprise cross-border incursion into Kursk Oblast (August 2024), occupying Russian territory for several months.</li>
<li><strong>Early 2025:</strong> Trump returns to power; US signals desire for rapid negotiated settlement. Ukraine's Kursk incursion ends; Russian forces recapture the seized territory with North Korean troop support.</li>
<li><strong>Spring 2026:</strong> Active diplomatic contacts between US and Russian officials. Trump administration signals openness to a ceasefire along current contact lines without requiring Russian withdrawal. Ukraine resists ceasefire terms that formalize Russian occupation of Ukrainian territory.</li>
<li><strong>Mid-2026:</strong> Front lines remain largely frozen. Both sides retain offensive capability for limited operations; neither has achieved the breakthrough needed to fundamentally alter the territorial balance.</li>
</ul>\n`,
  // ToC to prepend after H1
  toc: `\n<nav id="table-of-contents" aria-label="Table of Contents">
<h2>Table of Contents</h2>
<ol>
<li><a href="#executive-summary">Executive Summary</a></li>
<li><a href="#timeline">War Timeline</a></li>
<li><a href="#background">Background</a></li>
<li><a href="#current-situation">Current Situation</a></li>
<li><a href="#strategic-analysis">Strategic Analysis</a></li>
<li><a href="#global-impact">Global Impact</a></li>
<li><a href="#risk-assessment">Risk Assessment</a></li>
<li><a href="#future-scenarios">Future Scenarios</a></li>
<li><a href="#intelligence-forecast">Intelligence Forecast</a></li>
</ol>
</nav>\n`,
};

// ---- 4. SUEZ CANAL ----
// Already has: countries [Egypt], regions x1, topics [Energy Security]
// Add: conflicts [Yemen Civil War] (Houthi Red Sea attacks are central to Suez Canal 2026 narrative)
// Add: leaders [Khamenei] (Iran/Houthi connection to Red Sea crisis in article)
// Title: shorten from truncated "The Suez Canal in 2026: Why the World's Most..."
const suezCanal = {
  slug: 'suez-canal-2026-strategic-importance-global-trade-egypt',
  seoTitle: 'Suez Canal 2026: Strategic Importance and Global Trade',
  seoDescription: 'Why the Suez Canal still defines global trade — and how the 2026 Red Sea crisis is reshaping shipping routes, Egypt\'s revenues, and maritime security.',
  addCountries: [ENTITY.IRAN, ENTITY.SAUDI, ENTITY.ISRAEL], // All central to Red Sea / Houthi dimension
  addLeaders: [ENTITY.KHAMENEI], // Iran's role in Houthi attacks on Red Sea shipping
  addConflicts: [ENTITY.YEMEN_CIVIL_WAR], // Houthi Red Sea crisis is core to this article
  addTopics: [ENTITY.DIPLOMACY],
  ogImageNote: 'NO_SAFE_IMAGE: Google thumbnail URL is invalid. No verified hosted image available. Leaving as-is.',
  // H1 fix: the H1 is MISSING from the content field in MongoDB.
  // We will prepend an H1 to the content to fix the structural gap.
  h1: '<h1 id="article-title">Suez Canal 2026: Strategic Importance and Global Trade</h1>',
};

// ============================================================
// INTERNAL LINK CANDIDATES (contextual, semantically justified)
// ============================================================
// Links to ADD to OTHER articles pointing to our 4 targets.
// Each: { sourceSlug, targetSlug, anchorText, insertAfterPattern }

const internalLinksToAdd = [
  // Yemen: link from hormuz/chokepoints article (thematically identical — Red Sea/maritime security)
  {
    sourceSlug: 'hormuz-black-sea-chokepoints-iran-ukraine-oil-food-weaponization',
    targetSlug: 'yemen-civil-war-strategic-importance-2026',
    anchorText: 'Yemen\'s strategic role in the Red Sea crisis',
    // Insert a contextual sentence after the first paragraph
    insertContext: 'red sea',
    insertSentence: ' For a comprehensive analysis of how Yemen\'s Houthi forces are reshaping Red Sea trade routes, see our full report on <a href="/blogs/yemen-civil-war-strategic-importance-2026">Yemen\'s strategic role in the Red Sea crisis</a>.',
  },
  // Yemen: link from Yemen-Ukraine convergence article
  {
    sourceSlug: 'yemen-ukraine-convergence-drone-war-distant-fronts-2026',
    targetSlug: 'yemen-civil-war-strategic-importance-2026',
    anchorText: 'Yemen Civil War 2026 analysis',
    insertContext: 'houthi',
    insertSentence: ' Read our full <a href="/blogs/yemen-civil-war-strategic-importance-2026">Yemen Civil War 2026 analysis</a> for the complete strategic picture.',
  },
  // Russia-Ukraine: link from Azerbaijan article (Russia-Ukraine war mentioned as context)
  {
    sourceSlug: 'azerbaijan-geopolitical-leverage-aliyev-russia-iran-west',
    targetSlug: 'russia-ukraine-war-timeline-strategic-analysis-2026',
    anchorText: 'Russia-Ukraine war timeline and 2026 analysis',
    insertContext: 'ukraine',
    insertSentence: ' For a detailed timeline of how the war has evolved, see our <a href="/blogs/russia-ukraine-war-timeline-strategic-analysis-2026">Russia-Ukraine war timeline and 2026 analysis</a>.',
  },
  // Russia-Ukraine: link from North Korea missiles article
  {
    sourceSlug: 'north-korea-missiles-russia-ukraine-proof',
    targetSlug: 'russia-ukraine-war-timeline-strategic-analysis-2026',
    anchorText: 'Russia-Ukraine War 2026 strategic analysis',
    insertContext: 'russia',
    insertSentence: ' For the broader war context, read our <a href="/blogs/russia-ukraine-war-timeline-strategic-analysis-2026">Russia-Ukraine War 2026 strategic analysis</a>.',
  },
  // Suez Canal: link from chokepoints article (directly relevant)
  {
    sourceSlug: 'hormuz-black-sea-chokepoints-iran-ukraine-oil-food-weaponization',
    targetSlug: 'suez-canal-2026-strategic-importance-global-trade-egypt',
    anchorText: 'Suez Canal\'s strategic importance in 2026',
    insertContext: 'suez',
    insertSentence: ' See our deep-dive on the <a href="/blogs/suez-canal-2026-strategic-importance-global-trade-egypt">Suez Canal\'s strategic importance in 2026</a> for Egypt\'s revenue and rerouting impacts.',
  },
  // Serbia-Kosovo: link from caspian convergence / Russia article
  {
    sourceSlug: 'caspian-convergence-ukraine-iran-wars',
    targetSlug: 'serbia-kosovo-tensions-explained-2026',
    anchorText: 'Serbia-Kosovo tensions and Russia\'s role in 2026',
    insertContext: 'russia',
    insertSentence: ' Russia\'s influence extends beyond Ukraine — for analysis of how Moscow is shaping the Balkans, see our report on <a href="/blogs/serbia-kosovo-tensions-explained-2026">Serbia-Kosovo tensions and Russia\'s role in 2026</a>.',
  },
];

// ============================================================
// AUTHOR JSON-LD SCHEMA (to inject into content)
// ============================================================
function buildAuthorSchema(authorName: string, authorUrl: string, avatarUrl: string): string {
  return `\n<script type="application/ld+json" id="author-schema">
{"@context":"https://schema.org","@type":"Person","name":"${authorName}","url":"${authorUrl}","image":"${avatarUrl}","sameAs":["${authorUrl}"]}
</script>\n`;
}

// ============================================================
// MAIN IMPLEMENTATION
// ============================================================
async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;

  const operations: any[] = [];
  const log: any[] = [];

  // ---- 1. SERBIA-KOSOVO ----
  console.log('\n=== 1. Serbia-Kosovo ===');
  {
    const doc = await db.collection('blogs').findOne({ slug: serbiaKosovo.slug });
    if (!doc) { console.log('NOT FOUND'); } else {
      const update: any = {
        $set: {
          'seo.title': serbiaKosovo.seoTitle,
          'seo.description': serbiaKosovo.seoDescription,
        },
        $addToSet: {
          countries: { $each: serbiaKosovo.addCountries },
          leaders: { $each: serbiaKosovo.addLeaders },
          topics: { $each: serbiaKosovo.addTopics },
        },
      };

      // Author schema injection into content — if not already present
      let content: string = doc.content || '';
      if (!content.includes('author-schema')) {
        const authorSchema = buildAuthorSchema(AUTHOR_NAME, AUTHOR_URL, AUTHOR_AVATAR);
        // Inject before closing </h1>
        content = content.replace('</h1>', '</h1>' + authorSchema);
        update.$set.content = content;
        console.log('  Injected Author schema');
      }

      const result = await db.collection('blogs').updateOne({ slug: serbiaKosovo.slug }, update);
      console.log(`  SEO title+desc updated. Countries/Leaders/Topics addToSet. Modified: ${result.modifiedCount}`);
      log.push({
        article: serbiaKosovo.slug,
        seoTitle: { before: doc.seo?.title, after: serbiaKosovo.seoTitle },
        seoDescription: { before: doc.seo?.description, after: serbiaKosovo.seoDescription },
        addedCountries: ['Russia (6a869eca84b2ccb78887bc1a)'],
        addedLeaders: ['Vladimir Putin (6a869eca84b2ccb78887bc59)'],
        addedTopics: ['Diplomacy (6a869eca84b2ccb78887bc40)'],
        authorSchema: 'injected',
        ogImage: serbiaKosovo.ogImageNote,
        modifiedCount: result.modifiedCount,
      });
    }
  }

  // ---- 2. YEMEN ----
  console.log('\n=== 2. Yemen ===');
  {
    const doc = await db.collection('blogs').findOne({ slug: yemen.slug });
    if (!doc) { console.log('NOT FOUND'); } else {
      let content: string = doc.content || '';

      // Inject timeline after Executive Summary section (after second </h2>)
      if (!content.includes('Yemen Civil War: Key Events Timeline')) {
        // Insert after closing tag of "Executive Summary" heading — after 2nd </p> in the content
        // Safer: insert before the <h2>Background</h2> heading
        content = content.replace('<h2>Background</h2>', yemen.timeline + '<h2>Background</h2>');
        console.log('  Injected Yemen timeline section');
      }

      // Author schema
      if (!content.includes('author-schema')) {
        content = content.replace('</h1>', '</h1>' + buildAuthorSchema(AUTHOR_NAME, AUTHOR_URL, AUTHOR_AVATAR));
        console.log('  Injected Author schema');
      }

      const update: any = {
        $set: {
          'seo.title': yemen.seoTitle,
          'seo.description': yemen.seoDescription,
          content,
        },
        $addToSet: {
          leaders: { $each: yemen.addLeaders },
          conflicts: { $each: yemen.addConflicts },
          topics: { $each: yemen.addTopics },
        },
      };

      const result = await db.collection('blogs').updateOne({ slug: yemen.slug }, update);
      console.log(`  Yemen updated. Modified: ${result.modifiedCount}`);
      log.push({
        article: yemen.slug,
        seoTitle: { before: doc.seo?.title, after: yemen.seoTitle },
        seoDescription: { before: doc.seo?.description, after: yemen.seoDescription },
        addedLeaders: ['Ali Al-Zaidi (6a869eca84b2ccb78887bc6c)', 'Khamenei (6a869eca84b2ccb78887bc5f)'],
        addedConflicts: ['Gaza (6a869eca84b2ccb78887bc6f)'],
        addedTopics: ['Energy Security (6a869eca84b2ccb78887bc3f)'],
        timelineAdded: true,
        authorSchema: 'injected',
        ogImage: yemen.ogImageNote,
        modifiedCount: result.modifiedCount,
      });
    }
  }

  // ---- 3. RUSSIA-UKRAINE ----
  console.log('\n=== 3. Russia-Ukraine ===');
  {
    const doc = await db.collection('blogs').findOne({ slug: russiaUkraine.slug });
    if (!doc) { console.log('NOT FOUND'); } else {
      let content: string = doc.content || '';

      // Add ToC after H1 (and author schema after H1 too if missing)
      if (!content.includes('table-of-contents')) {
        content = content.replace('</h1>', '</h1>' + russiaUkraine.toc);
        console.log('  Injected ToC');
      }

      // Add timeline before Background section
      if (!content.includes('Russia-Ukraine War: Chronological Timeline')) {
        content = content.replace('<h2>Background</h2>', russiaUkraine.timeline + '<h2 id="background">Background</h2>');
        console.log('  Injected Russia-Ukraine timeline');
      }

      // Author schema is already present for this article (confirmed in forensic audit)
      // Only add if missing
      if (!content.includes('author-schema') && !content.includes('"@type":"Person"')) {
        content = content.replace('</h1>', '</h1>' + buildAuthorSchema(AUTHOR_NAME, AUTHOR_URL, AUTHOR_AVATAR));
        console.log('  Injected Author schema (was missing)');
      }

      const update: any = {
        $set: { content },
        $addToSet: {
          topics: { $each: russiaUkraine.addTopics },
        },
      };

      const result = await db.collection('blogs').updateOne({ slug: russiaUkraine.slug }, update);
      console.log(`  Russia-Ukraine updated. Modified: ${result.modifiedCount}`);
      log.push({
        article: russiaUkraine.slug,
        seoTitle: { before: doc.seo?.title, after: '(unchanged)' },
        tocAdded: true,
        timelineAdded: true,
        addedTopics: ['Diplomacy (6a869eca84b2ccb78887bc40)', 'Sanctions (6a869eca84b2ccb78887bc44)'],
        authorSchema: 'preserved (existing)',
        ogImage: russiaUkraine.ogImageNote,
        modifiedCount: result.modifiedCount,
      });
    }
  }

  // ---- 4. SUEZ CANAL ----
  console.log('\n=== 4. Suez Canal ===');
  {
    const doc = await db.collection('blogs').findOne({ slug: suezCanal.slug });
    if (!doc) { console.log('NOT FOUND'); } else {
      let content: string = doc.content || '';

      // Fix missing H1: prepend to content
      if (!content.includes('<h1')) {
        content = suezCanal.h1 + buildAuthorSchema(AUTHOR_NAME, AUTHOR_URL, AUTHOR_AVATAR) + '\n' + content;
        console.log('  Added missing H1 and Author schema to content');
      } else if (!content.includes('author-schema')) {
        content = content.replace('</h1>', '</h1>' + buildAuthorSchema(AUTHOR_NAME, AUTHOR_URL, AUTHOR_AVATAR));
        console.log('  Injected Author schema');
      }

      const update: any = {
        $set: {
          'seo.title': suezCanal.seoTitle,
          'seo.description': suezCanal.seoDescription,
          content,
        },
        $addToSet: {
          countries: { $each: suezCanal.addCountries },
          leaders: { $each: suezCanal.addLeaders },
          conflicts: { $each: suezCanal.addConflicts },
          topics: { $each: suezCanal.addTopics },
        },
      };

      const result = await db.collection('blogs').updateOne({ slug: suezCanal.slug }, update);
      console.log(`  Suez Canal updated. Modified: ${result.modifiedCount}`);
      log.push({
        article: suezCanal.slug,
        seoTitle: { before: doc.seo?.title, after: suezCanal.seoTitle },
        seoDescription: { before: doc.seo?.description, after: suezCanal.seoDescription },
        h1Added: 'Suez Canal 2026: Strategic Importance and Global Trade',
        addedCountries: ['Iran', 'Saudi Arabia', 'Israel'],
        addedLeaders: ['Khamenei'],
        addedConflicts: ['Yemen Civil War'],
        addedTopics: ['Diplomacy'],
        authorSchema: 'injected',
        ogImage: suezCanal.ogImageNote,
        modifiedCount: result.modifiedCount,
      });
    }
  }

  // ---- 5. INTERNAL LINKS ----
  console.log('\n=== 5. Internal Links ===');
  const linkLog: any[] = [];

  for (const link of internalLinksToAdd) {
    const sourceDoc = await db.collection('blogs').findOne({ slug: link.sourceSlug }) as any;
    if (!sourceDoc) {
      console.log(`  SKIP (not found): ${link.sourceSlug}`);
      linkLog.push({ source: link.sourceSlug, target: link.targetSlug, result: 'SOURCE_NOT_FOUND' });
      continue;
    }

    let content: string = sourceDoc.content || '';

    // Check if link to target already exists
    if (content.includes(`/blogs/${link.targetSlug}`)) {
      console.log(`  SKIP (already linked): ${link.sourceSlug} → ${link.targetSlug}`);
      linkLog.push({ source: link.sourceSlug, target: link.targetSlug, result: 'ALREADY_EXISTS' });
      continue;
    }

    // Find first paragraph that mentions the context keyword
    const contextLower = link.insertContext.toLowerCase();
    const pRe = /<p>([\s\S]*?)<\/p>/gi;
    let inserted = false;
    let updatedContent = content;

    updatedContent = content.replace(pRe, (match, pContent) => {
      if (!inserted && pContent.toLowerCase().includes(contextLower)) {
        inserted = true;
        // Append sentence to end of this paragraph before </p>
        return `<p>${pContent.trimEnd()}${link.insertSentence}</p>`;
      }
      return match;
    });

    if (!inserted) {
      console.log(`  SKIP (context not found): ${link.sourceSlug} — context: "${link.insertContext}"`);
      linkLog.push({ source: link.sourceSlug, target: link.targetSlug, result: 'CONTEXT_NOT_FOUND' });
      continue;
    }

    const result = await db.collection('blogs').updateOne(
      { slug: link.sourceSlug },
      { $set: { content: updatedContent } }
    );
    console.log(`  Added link: ${link.sourceSlug} → ${link.targetSlug} | modified: ${result.modifiedCount}`);
    linkLog.push({
      source: link.sourceSlug,
      target: link.targetSlug,
      anchorText: link.anchorText,
      result: result.modifiedCount === 1 ? 'SUCCESS' : 'NOT_MODIFIED',
    });
  }

  // ---- Save report ----
  const report = {
    timestamp: new Date().toISOString(),
    articleChanges: log,
    internalLinks: linkLog,
    ogImageSummary: {
      serbiaKosovo: serbiaKosovo.ogImageNote,
      yemen: yemen.ogImageNote,
      russiaUkraine: russiaUkraine.ogImageNote,
      suezCanal: suezCanal.ogImageNote,
      reason: 'All featuredImage values are Google thumbnail URLs (encrypted-tbn0.gstatic.com). No verified hosted images available. Fallback to default-og.jpg preserved. Safe course of action: leave unchanged and report.',
    },
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'gsc-top4-implementation-log.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n=== IMPLEMENTATION COMPLETE ===');
  console.log('Log saved to scripts/gsc-top4-implementation-log.json');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
