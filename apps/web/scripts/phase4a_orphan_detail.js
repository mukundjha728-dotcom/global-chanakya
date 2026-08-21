require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const fs = require("fs");
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  // Get full orphan data for analysis
  const orphanSlugs = [
    "mecca-defence-pact-turkey-pakistan-saudi-arabia-india-implications",
    "pakistan-shadow-security-problem-non-state-actors-2026",
    "zelensky-washington-reading-room-ukraine-military-purge-2026",
    "ceuta-tragedy-spain-morocco-deadliest-border-crisis-2026",
    "south-korea-gulf-gambit-air-defense-cheongung-uae-saudi-arabia",
    "brussels-vs-beijing-eu-trade-defense-wall-china-2026",
    "singapore-golden-vault-sovereign-reserve-hub-gold-trading",
    "truce-broke-iran-war-return-combat-islamabad-memorandum-collapse",
    "britain-nationalises-steel-economic-nationalism-returns",
    "why-india-matters-more-than-ever-economic-strategic-rise-2026",
    "the-end-of-globalization-why-the-world-economy-is-fragmenting-not-disappearing",
    "india-rise-global-manufacturing-power-china-plus-one-pli",
    "strategic-assassinations-modern-geopolitics-targeted-killing-doctrine",
    "intelligence-agencies-modern-hybrid-warfare-russia-china-gray-zone",
    "arctic-next-great-power-battlefield-russia-nato-china-greenland",
    "battle-for-africa-china-west-minerals-infrastructure-influence",
    "suez-canal-2026-strategic-importance-global-trade-egypt",
    "strait-of-hormuz-global-oil-security-analysis",
    "data-colonialism-nations-fight-over-information-analysis",
    "semiconductor-sovereignty-new-industrial-war-chips-act-reshoring",
    "starlink-warfare-space-internet-military-geopolitics-ukraine-china",
    "quantum-computing-national-security-risks-q-day-cryptography-us-china",
    "new-energy-map-red-sea-crisis-hormuz-cape-good-hope-global-trade-routes",
    "economic-corridors-vs-naval-chokepoints-global-power-analysis",
    "gold-strategic-central-banks-geopolitical-analysis",
    "strategic-risk-simultaneous-multi-theatre-wars-analysis",
    "north-korea-nuclear-expansion-strategy-analysis",
    "south-china-sea-world-war-three-trigger-escalation-analysis",
    "middle-powers-rising-turkey-saudi-arabia-india-analysis",
    "united-nations-great-power-rivalry-survival-analysis",
    "future-of-g20-fragmented-world-analysis",
    "india-worlds-ultimate-swing-power-strategic-analysis",
    "russia-china-iran-strategic-bloc-formation-analysis",
    "global-food-security-risks-war-geopolitical-analysis",
    "europe-energy-security-russia-gas-lng-nuclear-renewables-geopolitics",
    "weaponizing-culture-entertainment-social-media-new-frontlines-geopolitics",
    "future-dollar-global-trade-reserve-currency-2026",
    "ethiopia-tigray-conflict-deep-analysis-2026"
  ];
  
  const orphans = await db.collection("blogs").find(
    {slug: {$in: orphanSlugs}},
    {projection:{_id:1,slug:1,title:1,tags:1,category:1,"seo.keywords":1,"seo.title":1,excerpt:1}}
  ).toArray();
  
  const out = orphans.map(b => ({
    id: b._id.toString(),
    slug: b.slug,
    title: b.title,
    category: b.category,
    tags: b.tags,
    keywords: b.seo && b.seo.keywords,
    excerpt: (b.excerpt||"").substring(0,200)
  }));
  
  fs.writeFileSync("/tmp/phase4a_orphan_detail.json", JSON.stringify(out, null, 2));
  console.log("Orphan detail saved. Count:", orphans.length);
  
  await mongoose.connection.close();
}
run().catch(console.error);
