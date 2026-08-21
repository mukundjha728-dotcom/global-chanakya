require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const fs = require("fs");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const now = new Date().toISOString();
  
  // ============================================================
  // ENTITY REFERENCE MAP
  // ============================================================
  const topics = await db.collection("topics").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  const countries = await db.collection("countries").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  const leaders = await db.collection("leaders").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  const conflicts = await db.collection("conflicts").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  const organizations = await db.collection("organizations").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  
  // Create lookup maps
  const T = {}; topics.forEach(e => T[e.name] = e._id);
  const C = {}; countries.forEach(e => C[e.name] = e._id);
  const L = {}; leaders.forEach(e => L[e.name] = e._id);
  const CF = {}; conflicts.forEach(e => CF[e.name] = e._id);
  const O = {}; organizations.forEach(e => O[e.name] = e._id);
  
  console.log("Entity maps built:");
  console.log("Topics:", Object.keys(T).length, "Countries:", Object.keys(C).length);
  console.log("Leaders:", Object.keys(L).length, "Conflicts:", Object.keys(CF).length, "Orgs:", Object.keys(O).length);
  
  // ============================================================
  // ORPHAN ARTICLE ENTITY MAPPING
  // Evidence-based mapping only - matching title/tags/slug keywords
  // ============================================================
  const orphanMappings = [
    {
      slug: "mecca-defence-pact-turkey-pakistan-saudi-arabia-india-implications",
      countries: [C["Turkey"], C["Pakistan"], C["Saudi Arabia"], C["India"]],
      topics: [T["Diplomacy"]],
      reason: "Title + tags explicitly name Turkey, Pakistan, Saudi Arabia, India + defence pact (Diplomacy topic)"
    },
    {
      slug: "pakistan-shadow-security-problem-non-state-actors-2026",
      countries: [C["Pakistan"]],
      topics: [T["Terrorism"]],
      reason: "Title names Pakistan; tags include TTP, ISKP, BLA (Terrorism topic)"
    },
    {
      slug: "zelensky-washington-reading-room-ukraine-military-purge-2026",
      countries: [C["Ukraine"], C["United States"]],
      leaders: [L["Zelensky"], L["Donald Trump"]],
      conflicts: [CF["Ukraine War"]],
      topics: [T["Diplomacy"]],
      reason: "Title names Zelensky+Washington+Ukraine; tags confirm Ukraine Military Purge; Ukraine War conflict"
    },
    {
      slug: "ceuta-tragedy-spain-morocco-deadliest-border-crisis-2026",
      topics: [T["Diplomacy"]],
      reason: "Spain/Morocco not in country taxonomy; Diplomacy topic from EU Migration context"
    },
    {
      slug: "south-korea-gulf-gambit-air-defense-cheongung-uae-saudi-arabia",
      countries: [C["South Korea"], C["UAE"], C["Saudi Arabia"]],
      topics: [T["Military Modernization"]],
      reason: "Title+tags: South Korea, UAE, Saudi Arabia explicitly; air defense = Military Modernization"
    },
    {
      slug: "brussels-vs-beijing-eu-trade-defense-wall-china-2026",
      countries: [C["China"]],
      topics: [T["Trade War"]],
      reason: "Title: EU vs China trade; tags: EU China Trade War, EV Tariffs = Trade War topic"
    },
    {
      slug: "singapore-golden-vault-sovereign-reserve-hub-gold-trading",
      topics: [T["De-dollarization"]],
      reason: "Singapore not in taxonomy; tags include De-dollarization Gold = De-dollarization topic"
    },
    {
      slug: "truce-broke-iran-war-return-combat-islamabad-memorandum-collapse",
      countries: [C["Iran"]],
      leaders: [L["Khamenei"]],
      topics: [T["Nuclear Deterrence"]],
      reason: "Title: Iran War, Islamabad Memorandum; tags: Operation Epic Fury = Iran conflict. Khamenei implied leader"
    },
    {
      slug: "britain-nationalises-steel-economic-nationalism-returns",
      topics: [T["Trade War"]],
      reason: "UK not in country taxonomy; Economic nationalism = Trade War topic; EU/UK industrial policy"
    },
    {
      slug: "why-india-matters-more-than-ever-economic-strategic-rise-2026",
      countries: [C["India"]],
      leaders: [L["Narendra Modi"]],
      topics: [T["Strategic Autonomy"]],
      reason: "Title: India; tags: India Strategic Importance; Modi is primary India leader"
    },
    {
      slug: "the-end-of-globalization-why-the-world-economy-is-fragmenting-not-disappearing",
      topics: [T["Trade War"], T["Supply Chain Security"]],
      reason: "Tags: Deglobalization, Trade Fragmentation, Friend-Shoring = Trade War + Supply Chain Security"
    },
    {
      slug: "india-rise-global-manufacturing-power-china-plus-one-pli",
      countries: [C["India"], C["China"]],
      leaders: [L["Narendra Modi"]],
      topics: [T["Trade War"]],
      reason: "Title: India + China; tags: India Manufacturing, China Plus One, PLI = Trade War context"
    },
    {
      slug: "strategic-assassinations-modern-geopolitics-targeted-killing-doctrine",
      leaders: [L["Khamenei"]],
      topics: [T["Gray-Zone Warfare"]],
      reason: "Tags: Khamenei Strike (leader); Targeted Killing is Gray-Zone Warfare doctrine"
    },
    {
      slug: "intelligence-agencies-modern-hybrid-warfare-russia-china-gray-zone",
      countries: [C["Russia"], C["China"]],
      leaders: [L["Vladimir Putin"], L["Xi Jinping"]],
      topics: [T["Gray-Zone Warfare"], T["Cyber Espionage"]],
      reason: "Tags: Hybrid Warfare, GRU FSB SVR (Russia/China leaders); Gray-Zone + Cyber Espionage topics"
    },
    {
      slug: "arctic-next-great-power-battlefield-russia-nato-china-greenland",
      countries: [C["Russia"], C["China"]],
      leaders: [L["Vladimir Putin"]],
      organizations: [O["NATO"]],
      reason: "Tags: NATO Arctic Sentry, Russia Northern Fleet; Russia/China/NATO explicitly named"
    },
    {
      slug: "battle-for-africa-china-west-minerals-infrastructure-influence",
      countries: [C["China"]],
      leaders: [L["Xi Jinping"]],
      topics: [T["Critical Minerals"]],
      reason: "Tags: China Africa, Critical Minerals Africa; Xi Jinping = China leader"
    },
    {
      slug: "suez-canal-2026-strategic-importance-global-trade-egypt",
      countries: [C["Egypt"]],
      topics: [T["Energy Security"]],
      reason: "Title: Suez Canal + Egypt; tags: Egypt Economy, Global Trade Routes = Energy Security topic"
    },
    {
      slug: "strait-of-hormuz-global-oil-security-analysis",
      countries: [C["Iran"]],
      topics: [T["Energy Security"]],
      reason: "Tags: Iran Naval Strategy, Persian Gulf Energy = Iran country + Energy Security topic"
    },
    {
      slug: "data-colonialism-nations-fight-over-information-analysis",
      countries: [C["China"], C["United States"]],
      topics: [T["Cyber Warfare"]],
      reason: "Tags: Digital Silk Road (China), Data Sovereignty; Cyber Warfare is the primary topic"
    },
    {
      slug: "semiconductor-sovereignty-new-industrial-war-chips-act-reshoring",
      countries: [C["China"], C["United States"]],
      topics: [T["Semiconductors"]],
      reason: "Tags: CHIPS Act (US), EU Chips Act, India Semiconductor, Rapidus Japan = Semiconductors topic"
    },
    {
      slug: "starlink-warfare-space-internet-military-geopolitics-ukraine-china",
      countries: [C["Ukraine"], C["China"]],
      conflicts: [CF["Ukraine War"]],
      topics: [T["Drone Warfare"]],
      reason: "Tags: Starlink Warfare Ukraine (Ukraine War conflict); satellite comms = Drone Warfare topic"
    },
    {
      slug: "quantum-computing-national-security-risks-q-day-cryptography-us-china",
      countries: [C["China"], C["United States"]],
      topics: [T["Cyber Warfare"]],
      reason: "Tags: US China Quantum Race; Harvest Now Decrypt Later = Cyber Warfare security threat"
    },
    {
      slug: "new-energy-map-red-sea-crisis-hormuz-cape-good-hope-global-trade-routes",
      countries: [C["Iran"], C["Yemen"]],
      conflicts: [CF["Yemen Civil War"]],
      topics: [T["Energy Security"]],
      reason: "Tags: Red Sea Crisis (Yemen conflict), Hormuz (Iran); Energy Trade Routes = Energy Security"
    },
    {
      slug: "economic-corridors-vs-naval-chokepoints-global-power-analysis",
      countries: [C["China"]],
      topics: [T["Energy Security"]],
      reason: "Tags: Belt and Road Initiative (China), CPEC, Malacca Strait = Energy Security chokepoint"
    },
    {
      slug: "gold-strategic-central-banks-geopolitical-analysis",
      countries: [C["Russia"], C["China"]],
      topics: [T["De-dollarization"]],
      reason: "Tags: Russia Gold Reserves, De-dollarization Gold; both countries hold strategic gold"
    },
    {
      slug: "strategic-risk-simultaneous-multi-theatre-wars-analysis",
      countries: [C["United States"], C["China"]],
      topics: [T["Nuclear Deterrence"]],
      organizations: [O["NATO"]],
      reason: "Tags: US Military Readiness, NATO Ukraine China Taiwan; Nuclear Deterrence topic"
    },
    {
      slug: "north-korea-nuclear-expansion-strategy-analysis",
      countries: [C["North Korea"]],
      leaders: [L["Kim Jong Un"]],
      topics: [T["Nuclear Deterrence"]],
      reason: "Tags: Kim Jong-un Nuclear Doctrine, DPRK ICBM = Kim Jong Un + Nuclear Deterrence"
    },
    {
      slug: "south-china-sea-world-war-three-trigger-escalation-analysis",
      countries: [C["China"], C["Philippines"]],
      leaders: [L["Xi Jinping"]],
      conflicts: [CF["South China Sea"]],
      reason: "Tags: Philippines China Dispute, Taiwan South China Sea = South China Sea conflict + Xi Jinping"
    },
    {
      slug: "middle-powers-rising-turkey-saudi-arabia-india-analysis",
      countries: [C["Turkey"], C["Saudi Arabia"], C["India"]],
      topics: [T["Strategic Autonomy"]],
      reason: "Tags: Turkey Foreign Policy, Saudi Arabia Strategic Hedging, India Strategic Autonomy"
    },
    {
      slug: "united-nations-great-power-rivalry-survival-analysis",
      topics: [T["Multipolarity"]],
      reason: "Tags: UN Security Council Reform, Great Power Rivalry = Multipolarity topic"
    },
    {
      slug: "future-of-g20-fragmented-world-analysis",
      topics: [T["Multipolarity"]],
      reason: "Tags: G20 vs BRICS, Fragmented World Order = Multipolarity topic"
    },
    {
      slug: "india-worlds-ultimate-swing-power-strategic-analysis",
      countries: [C["India"]],
      leaders: [L["Narendra Modi"]],
      topics: [T["Strategic Autonomy"]],
      reason: "Tags: India Strategic Autonomy, India Foreign Policy, Swing Power = Strategic Autonomy + India + Modi"
    },
    {
      slug: "russia-china-iran-strategic-bloc-formation-analysis",
      countries: [C["Russia"], C["China"], C["Iran"]],
      leaders: [L["Vladimir Putin"], L["Xi Jinping"], L["Khamenei"]],
      reason: "Title explicitly names Russia, China, Iran; tags: Russia China Iran Axis = all 3 leaders"
    },
    {
      slug: "global-food-security-risks-war-geopolitical-analysis",
      topics: [T["Climate Risk"]],
      reason: "Tags: Ukraine Grain Deal, Global Hunger, Conflict and Famine = Climate Risk topic (food security)"
    },
    {
      slug: "europe-energy-security-russia-gas-lng-nuclear-renewables-geopolitics",
      countries: [C["Russia"]],
      topics: [T["Energy Security"]],
      reason: "Tags: Russian Gas Phase-Out, REPowerEU = Russia country + Energy Security topic"
    },
    {
      slug: "weaponizing-culture-entertainment-social-media-new-frontlines-geopolitics",
      topics: [T["Disinformation"]],
      reason: "Tags: Information Warfare, TikTok, Deepfakes = Disinformation topic"
    },
    {
      slug: "future-dollar-global-trade-reserve-currency-2026",
      leaders: [L["Xi Jinping"]],
      topics: [T["De-dollarization"], T["Dollar Hegemony"]],
      organizations: [O["BRICS"]],
      reason: "Tags: BRICS, De-dollarization, Xi Jinping = BRICS org + De-dollarization + Dollar Hegemony topics"
    },
    {
      slug: "ethiopia-tigray-conflict-deep-analysis-2026",
      topics: [T["Diplomacy"]],
      reason: "Ethiopia not in country taxonomy; Tags: Tigray, TPLF, Abiy Ahmed; Diplomacy topic (regional peace)"
    }
  ];
  
  console.log("\n=== STEP 2: Orphan entity recovery ===");
  const changeManifest = [];
  
  for (const mapping of orphanMappings) {
    const article = await db.collection("blogs").findOne({slug: mapping.slug}, {projection:{_id:1,slug:1,title:1,"seo.title":1,"seo.description":1,topics:1,countries:1,leaders:1,conflicts:1,organizations:1}});
    if (!article) { console.log("NOT FOUND:", mapping.slug); continue; }
    
    const updateFields = {};
    if (mapping.topics && mapping.topics.filter(Boolean).length > 0) updateFields.topics = mapping.topics.filter(Boolean);
    if (mapping.countries && mapping.countries.filter(Boolean).length > 0) updateFields.countries = mapping.countries.filter(Boolean);
    if (mapping.leaders && mapping.leaders.filter(Boolean).length > 0) updateFields.leaders = mapping.leaders.filter(Boolean);
    if (mapping.conflicts && mapping.conflicts.filter(Boolean).length > 0) updateFields.conflicts = mapping.conflicts.filter(Boolean);
    if (mapping.organizations && mapping.organizations.filter(Boolean).length > 0) updateFields.organizations = mapping.organizations.filter(Boolean);
    
    if (Object.keys(updateFields).length === 0) {
      console.log("SKIP (no entities):", mapping.slug);
      continue;
    }
    
    await db.collection("blogs").updateOne(
      {_id: article._id},
      {$set: updateFields}
    );
    
    changeManifest.push({
      _id: article._id.toString(),
      slug: article.slug,
      action: "entity_recovery",
      oldRelationships: {
        topics: (article.topics||[]).map(x=>x.toString()),
        countries: (article.countries||[]).map(x=>x.toString()),
        leaders: (article.leaders||[]).map(x=>x.toString()),
        conflicts: (article.conflicts||[]).map(x=>x.toString()),
        organizations: (article.organizations||[]).map(x=>x.toString())
      },
      newRelationships: updateFields,
      reason: mapping.reason,
      timestamp: now
    });
    console.log("UPDATED:", mapping.slug, "fields:", Object.keys(updateFields).join(","));
  }
  
  fs.writeFileSync("/tmp/phase4a_change_manifest_step2.json", JSON.stringify(changeManifest, null, 2));
  console.log("Step 2 complete. Updated:", changeManifest.length, "articles");
  
  await mongoose.connection.close();
}
run().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
