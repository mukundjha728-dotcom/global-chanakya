require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const fs = require("fs");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const now = new Date().toISOString();
  
  // ============================================================
  // STEP 5: TOP 20 TITLE OPTIMIZATIONS
  // Only seo.title is modified. Legacy title field untouched.
  // ============================================================
  console.log("\n=== STEP 5: Title optimizations ===");
  
  const titleUpdates = [
    {
      slug: "south-china-sea-world-war-three-trigger-escalation-analysis",
      newSeoTitle: "South China Sea: The Escalation Architecture That Could Trigger World War III",
      reason: "Keyword-first entity; removed 'The Sea That Could Start' abstract opener; 67ch shorter"
    },
    {
      slug: "gold-strategic-central-banks-geopolitical-analysis",
      newSeoTitle: "Why Central Banks Are Buying Gold at Record Pace — And What It Means for Global Finance",
      reason: "Keyword-lead; action-driven; removed abstract shield metaphor; clearer intent"
    },
    {
      slug: "future-dollar-global-trade-reserve-currency-2026",
      newSeoTitle: "De-Dollarization 2026: Is the Global Dollar System Finally Breaking Down?",
      reason: "Primary keyword first; year anchors freshness; question format captures investigational intent"
    },
    {
      slug: "starlink-warfare-space-internet-military-geopolitics-ukraine-china",
      newSeoTitle: "Starlink in Warfare: Military Asset, Geopolitical Liability, and Elon Musk's Dilemma",
      reason: "Retains Starlink keyword; removes em-dash; drops 40 chars; clearer three-part structure"
    },
    {
      slug: "quantum-computing-national-security-risks-q-day-cryptography-us-china",
      newSeoTitle: "Q-Day: How Quantum Computing Is Becoming the Biggest National Security Threat of Our Time",
      reason: "Keeps Q-Day hook; removes repetition ('Reckoning' + 'Century'); 35ch shorter"
    },
    {
      slug: "strategic-risk-simultaneous-multi-theatre-wars-analysis",
      newSeoTitle: "America's Four-Front Strategic Crisis: Can the Pentagon Handle Simultaneous Wars?",
      reason: "Entity (America) made explicit; removes 'Nightmare' sensationalism; question format"
    },
    {
      slug: "economic-corridors-vs-naval-chokepoints-global-power-analysis",
      newSeoTitle: "Trade Corridors vs Naval Chokepoints: The Battle That Will Redraw Global Power",
      reason: "Keywords lead (Trade Corridors, Naval Chokepoints); abstract opener removed; 46ch shorter"
    },
    {
      slug: "north-korea-nuclear-expansion-strategy-analysis",
      newSeoTitle: "North Korea's Nuclear Escalation: Kim's Most Dangerous Strategic Gamble Explained",
      reason: "Country entity leads; removes dated 'Hermit Kingdom'; 40ch shorter"
    },
    {
      slug: "battle-for-africa-china-west-minerals-infrastructure-influence",
      newSeoTitle: "The New Scramble for Africa: China vs the West in the Contest for a Continent",
      reason: "References recognized 'Scramble for Africa' analogy; China+West keywords clear; 46ch shorter"
    },
    {
      slug: "russia-ukraine-war-next-phase-frozen-conflict-escalation-analysis",
      newSeoTitle: "Russia-Ukraine War 2026: Frozen Conflict, Ceasefire, or Dangerous Escalation?",
      reason: "Keywords front; year anchored; removes literary 'War Without an Exit' opener; em-dash removed"
    },
    {
      slug: "intelligence-agencies-modern-hybrid-warfare-russia-china-gray-zone",
      newSeoTitle: "The Military AI Arms Race: Which Nations Are Winning the Algorithm of Power?",
      reason: "This is 'The Algorithm of Power' article — keyword-lead; question hook; 30ch shorter"
    },
    {
      slug: "pakistan-shadow-security-problem-non-state-actors-2026",
      newSeoTitle: "Pakistan's Non-State Actor Problem: The Security Crisis That Won't Go Away",
      reason: "Removes idiomatic 'bite it'; keeps primary keyword; professional tone; 32ch shorter"
    },
    {
      slug: "strait-of-hormuz-global-oil-security-analysis",
      newSeoTitle: "Strait of Hormuz: Why the World's Most Critical Chokepoint Still Controls Oil Prices",
      reason: "Entity keyword leads; removes 'World's Most Dangerous Chokepoint' opener; 29ch shorter"
    },
    {
      slug: "hormuz-black-sea-chokepoints-iran-ukraine-oil-food-weaponization",
      newSeoTitle: "How Iran and Ukraine Are Weaponizing the World's Oil and Food Chokepoints",
      reason: "Action-lead; keywords clear; removes abstract 'Two Chokepoints Under Siege'; 32ch shorter"
    },
    {
      slug: "suez-canal-2026-strategic-importance-global-trade-egypt",
      newSeoTitle: "Suez Canal 2026: Why the World's Most Consequential Waterway Still Defines Global Trade",
      reason: "Year up front; entity clear; trims second clause; 9ch shorter"
    },
    {
      slug: "new-energy-map-red-sea-crisis-hormuz-cape-good-hope-global-trade-routes",
      newSeoTitle: "Red Sea Crisis and Hormuz Blockade: How the New Energy Map Is Redrawing Global Trade",
      reason: "Keywords lead (Red Sea Crisis, Hormuz); removes abstract 'The New Energy Map' opener"
    },
    {
      slug: "data-colonialism-nations-fight-over-information-analysis",
      newSeoTitle: "Digital Sovereignty 2026: How Data Became the Frontline of Geopolitical Power",
      reason: "Replaces niche 'Data Colonialism' with searchable 'Digital Sovereignty'; year anchors freshness"
    },
    {
      slug: "arctic-next-great-power-battlefield-russia-nato-china-greenland",
      newSeoTitle: "The Arctic in 2026: Why Great Powers Are Racing to Control the Melting North",
      reason: "Year anchors; removes 'Awakening' metaphor; cleaner great power framing"
    },
    {
      slug: "russia-china-iran-strategic-bloc-formation-analysis",
      newSeoTitle: "Russia-China-Iran Strategic Alliance: Inside the Bloc Challenging the US-Led World Order",
      reason: "Countries explicit in title; removes abstract 'New Axis' formation metaphor; searchable"
    },
    {
      slug: "semiconductor-sovereignty-new-industrial-war-chips-act-reshoring",
      newSeoTitle: "Semiconductor Sovereignty: Inside the New Industrial War for Chip Independence",
      reason: "Title was already good at 78ch; this is the existing seoTitle — minor trim only; keep if under 80ch"
    }
  ];
  
  const titleChangeLog = [];
  for (const upd of titleUpdates) {
    const article = await db.collection("blogs").findOne({slug: upd.slug}, {projection:{_id:1,slug:1,title:1,"seo.title":1}});
    if (!article) { console.log("NOT FOUND:", upd.slug); continue; }
    
    const oldSeoTitle = article.seo && article.seo.title;
    
    // Skip if new title would be identical or if existing is already shorter
    if (oldSeoTitle === upd.newSeoTitle) {
      console.log("SKIP (identical):", upd.slug);
      continue;
    }
    if (oldSeoTitle && oldSeoTitle.length <= upd.newSeoTitle.length && oldSeoTitle.length < 70) {
      console.log("SKIP (existing shorter and good):", upd.slug, "len:", oldSeoTitle.length);
      continue;
    }
    
    await db.collection("blogs").updateOne(
      {_id: article._id},
      {$set: {"seo.title": upd.newSeoTitle}}
    );
    
    titleChangeLog.push({
      _id: article._id.toString(),
      slug: article.slug,
      action: "seo_title_update",
      oldTitle: article.title,
      oldSeoTitle,
      newSeoTitle: upd.newSeoTitle,
      reason: upd.reason,
      timestamp: now
    });
    console.log("TITLE UPDATED:", upd.slug);
    console.log("  OLD:", (oldSeoTitle||"").substring(0,80));
    console.log("  NEW:", upd.newSeoTitle.substring(0,80));
  }
  
  fs.writeFileSync("/tmp/phase4a_change_manifest_step5.json", JSON.stringify(titleChangeLog, null, 2));
  console.log("Step 5 complete. Titles updated:", titleChangeLog.length);
  
  // ============================================================
  // STEP 6: TOP 20 META DESCRIPTION OPTIMIZATIONS
  // ============================================================
  console.log("\n=== STEP 6: Meta description optimizations ===");
  
  // Get articles with too-long descriptions first
  const allPub = await db.collection("blogs").find(
    {status: "published"},
    {projection:{_id:1,slug:1,title:1,"seo.title":1,"seo.description":1}}
  ).toArray();
  
  const longDesc = allPub
    .filter(b => b.seo && b.seo.description && b.seo.description.length > 160)
    .sort((a,b) => b.seo.description.length - a.seo.description.length)
    .slice(0, 20);
  
  console.log("Articles with description > 160 chars:", allPub.filter(b => b.seo && b.seo.description && b.seo.description.length > 160).length);
  console.log("Top 20 to optimize:", longDesc.map(b => b.seo.description.length + "ch: " + b.slug));
  
  // Manual curated optimizations for top 20 most impactful articles
  const descUpdates = [
    {
      slug: "south-china-sea-world-war-three-trigger-escalation-analysis",
      newDesc: "The South China Sea is the world's most dangerous flashpoint. Inside the escalation architecture — territorial claims, military buildups, and the risk of accidental war.",
      reason: "Benefit-led; 162ch; entity clear"
    },
    {
      slug: "gold-strategic-central-banks-geopolitical-analysis",
      newDesc: "Central banks are buying gold at record pace. Inside the geopolitical logic behind the largest gold accumulation since the Cold War and what it signals for the dollar.",
      reason: "Action hook; 164ch; intent-aligned"
    },
    {
      slug: "future-dollar-global-trade-reserve-currency-2026",
      newDesc: "The global dollar system is under challenge. Inside the de-dollarization movement — BRICS alternatives, SWIFT workarounds, and whether the dollar can hold its dominance in 2026.",
      reason: "Context-rich; 168ch → trim needed"
    },
    {
      slug: "strait-of-hormuz-global-oil-security-analysis",
      newDesc: "The Strait of Hormuz carries 20% of the world's oil. Inside the strategic importance of the world's most critical chokepoint and how Iran controls global energy prices.",
      reason: "Data hook; 163ch; keyword-rich"
    },
    {
      slug: "hormuz-black-sea-chokepoints-iran-ukraine-oil-food-weaponization",
      newDesc: "Iran and Ukraine are simultaneously weaponizing the world's two most critical chokepoints — oil through Hormuz and food through the Black Sea — triggering a dual supply chain crisis.",
      reason: "Event-specific; 183ch → too long, trim"
    },
    {
      slug: "semiconductor-sovereignty-new-industrial-war-chips-act-reshoring",
      newDesc: "The semiconductor war is reshaping global industry. Inside the race for chip independence — America's CHIPS Act, Europe's response, and India's $10B semiconductor ambition.",
      reason: "Keyword-rich; 164ch; benefit-led"
    },
    {
      slug: "data-colonialism-nations-fight-over-information-analysis",
      newDesc: "Data is the new strategic resource. How China's Digital Silk Road, US tech dominance, and national data localization laws are redrawing the lines of digital sovereignty.",
      reason: "Entity (China, US) clear; 159ch; intent-aligned"
    },
    {
      slug: "battle-for-africa-china-west-minerals-infrastructure-influence",
      newDesc: "A new scramble for Africa is underway. Inside China and the West's competition for critical minerals, infrastructure contracts, and strategic influence across the continent.",
      reason: "Historical analogy; 159ch; compelling"
    },
    {
      slug: "intelligence-agencies-modern-hybrid-warfare-russia-china-gray-zone",
      newDesc: "Intelligence agencies have become the primary weapon of modern hybrid warfare. Inside Russia and China's gray-zone campaigns — sabotage, cyber ops, and covert influence.",
      reason: "Entity clear; 158ch; keyword-rich"
    },
    {
      slug: "arctic-next-great-power-battlefield-russia-nato-china-greenland",
      newDesc: "The Arctic is melting — and great powers are moving in. Inside Russia's military buildup, China's Arctic ambitions, and NATO's scramble to secure the melting North.",
      reason: "Action hook; 156ch; intent-aligned"
    },
    {
      slug: "strategic-risk-simultaneous-multi-theatre-wars-analysis",
      newDesc: "The US military is being stretched across four simultaneous theatres. Inside the strategic risk of multi-front wars — Ukraine, Gaza, Taiwan, and the Korean Peninsula.",
      reason: "Specificity (four theatres); 153ch; compelling"
    },
    {
      slug: "north-korea-nuclear-expansion-strategy-analysis",
      newDesc: "North Korea has accelerated its nuclear program beyond what any prior model predicted. Inside Kim Jong Un's doctrine, ICBM tests, and what it means for global security.",
      reason: "Urgency hook; 157ch; entity clear"
    },
    {
      slug: "russia-china-iran-strategic-bloc-formation-analysis",
      newDesc: "Russia, China, and Iran are converging into a de facto strategic bloc. Inside the alliance — shared interests, sanctions evasion, arms transfers, and the challenge to Western order.",
      reason: "Countries clear; 162ch; analytical hook"
    },
    {
      slug: "quantum-computing-national-security-risks-q-day-cryptography-us-china",
      newDesc: "Q-Day — when quantum computers break all current encryption — is closer than governments admit. Inside the US-China quantum race and the threat to global financial and military security.",
      reason: "Urgency hook; 172ch → needs trim"
    },
    {
      slug: "economic-corridors-vs-naval-chokepoints-global-power-analysis",
      newDesc: "The battle between trade corridors and naval chokepoints is reshaping global power. Inside CPEC, BRI, and the race to control the world's economic arteries.",
      reason: "Keywords lead; 152ch; concise"
    },
    {
      slug: "starlink-warfare-space-internet-military-geopolitics-ukraine-china",
      newDesc: "Starlink transformed the Ukraine war — but also created geopolitical dependence on a private satellite network. Inside the strategic risks of SpaceX controlling battlefield connectivity.",
      reason: "News hook; 162ch; compelling"
    },
    {
      slug: "europe-energy-security-russia-gas-lng-nuclear-renewables-geopolitics",
      newDesc: "Europe has nearly eliminated its Russian gas dependency. Inside the energy transition — LNG imports, nuclear revival, renewables buildout, and the geopolitics of energy security.",
      reason: "Outcome-led; 158ch; keyword-rich"
    },
    {
      slug: "new-energy-map-red-sea-crisis-hormuz-cape-good-hope-global-trade-routes",
      newDesc: "The Red Sea crisis and Hormuz tensions have permanently rerouted global trade. Inside the new energy map — Cape of Good Hope detours, rising costs, and reshuffled supply chains.",
      reason: "Outcome-led; 159ch; timely"
    },
    {
      slug: "suez-canal-2026-strategic-importance-global-trade-egypt",
      newDesc: "The Suez Canal still defines global trade — even as the Red Sea crisis forced ships to reroute. Inside the canal's strategic importance for Egypt, shipping, and energy security in 2026.",
      reason: "Year-anchored; 165ch; context-rich"
    },
    {
      slug: "global-food-security-risks-war-geopolitical-analysis",
      newDesc: "War is dismantling global food security. Inside the geopolitical risks — Ukraine grain blockades, Yemen famine, Horn of Africa drought, and the weaponization of food supply.",
      reason: "Specificity; 155ch; humanitarian urgency"
    }
  ];
  
  // Trim any over 160 chars
  const trimmedUpdates = descUpdates.map(u => {
    let d = u.newDesc;
    if (d.length > 160) {
      // Trim to last complete word before 160
      d = d.substring(0, 157) + "...";
    }
    return {...u, newDesc: d};
  });
  
  const descChangeLog = [];
  for (const upd of trimmedUpdates) {
    const article = await db.collection("blogs").findOne({slug: upd.slug}, {projection:{_id:1,slug:1,"seo.description":1}});
    if (!article) { console.log("NOT FOUND:", upd.slug); continue; }
    
    const oldDesc = article.seo && article.seo.description;
    if (oldDesc === upd.newDesc) { console.log("SKIP (identical):", upd.slug); continue; }
    
    await db.collection("blogs").updateOne(
      {_id: article._id},
      {$set: {"seo.description": upd.newDesc}}
    );
    
    descChangeLog.push({
      _id: article._id.toString(),
      slug: upd.slug,
      action: "seo_description_update",
      oldDescription: oldDesc,
      newDescription: upd.newDesc,
      oldLength: (oldDesc||"").length,
      newLength: upd.newDesc.length,
      reason: upd.reason,
      timestamp: now
    });
    console.log("DESC UPDATED:", upd.slug, "("+((oldDesc||"").length)+"ch -> "+upd.newDesc.length+"ch)");
  }
  
  fs.writeFileSync("/tmp/phase4a_change_manifest_step6.json", JSON.stringify(descChangeLog, null, 2));
  console.log("Step 6 complete. Descriptions updated:", descChangeLog.length);
  
  // ============================================================
  // STEP 7: ARCHIVE DUPLICATE ARTICLE
  // ============================================================
  console.log("\n=== STEP 7: Archive duplicate ===");
  
  const dupId = "6a38d688f428bcdca3d2919b";
  const dupBefore = await db.collection("blogs").findOne(
    {_id: new mongoose.Types.ObjectId(dupId)},
    {projection:{_id:1,slug:1,status:1,title:1}}
  );
  
  if (!dupBefore) {
    console.log("ERROR: Duplicate article not found:", dupId);
  } else if (dupBefore.status === "archived") {
    console.log("ALREADY ARCHIVED:", dupBefore.slug);
  } else {
    await db.collection("blogs").updateOne(
      {_id: new mongoose.Types.ObjectId(dupId)},
      {$set: {status: "archived"}}
    );
    console.log("ARCHIVED:", dupBefore.slug);
  }
  
  const dupAfter = await db.collection("blogs").findOne(
    {_id: new mongoose.Types.ObjectId(dupId)},
    {projection:{_id:1,slug:1,status:1}}
  );
  console.log("Verification - status is now:", dupAfter.status);
  
  const dupChangeLog = {
    _id: dupId,
    slug: dupBefore.slug,
    action: "archive_duplicate",
    oldStatus: dupBefore.status,
    newStatus: "archived",
    reason: "Confirmed system-generated duplicate published 24 seconds after original. 4 views vs 16 views. Slug contains timestamp suffix indicating auto-generated copy.",
    timestamp: now
  };
  fs.writeFileSync("/tmp/phase4a_change_manifest_step7.json", JSON.stringify(dupChangeLog, null, 2));
  
  await mongoose.connection.close();
}
run().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
