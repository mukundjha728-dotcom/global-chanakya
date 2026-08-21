const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config({path:".env.local"});

const testUrls = [
  "india-growth-defence-geopolitics-before-after-2014",
  "top-10-strongest-militaries-in-the-world-2026",
  "why-chinas-economy-is-failing",
  "us-china-trade-war-impact-2025",
  "russia-ukraine-conflict-timeline",
  "global-chip-shortage-taiwan",
  "israel-hamas-conflict-middle-east",
  "nato-expansion-nordic-countries",
  "artificial-intelligence-military-applications",
  "india-middle-east-europe-economic-corridor"
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  // Find 10 valid published slugs to test
  const blogs = await db.collection("blogs").find({ status: "published" }).limit(10).toArray();
  const slugs = blogs.map(b => b.slug);
  // Ensure the explicitly requested one is in there
  if(!slugs.includes("india-growth-defence-geopolitics-before-after-2014")) {
     slugs[0] = "india-growth-defence-geopolitics-before-after-2014";
  }
  await mongoose.connection.close();
  
  console.log("Testing", slugs.length, "URLs...");
  
  let successCount = 0;
  for(const slug of slugs) {
    await new Promise((resolve) => {
      http.get(`http://localhost:3000/blogs/${slug}`, (res) => {
         let data = "";
         res.on("data", chunk => data += chunk);
         res.on("end", () => {
            if(res.statusCode === 200 && !data.includes("Intel Retrieval Failed")) {
               console.log(`[PASS] /blogs/${slug} -> HTTP 200`);
               successCount++;
            } else {
               console.log(`[FAIL] /blogs/${slug} -> HTTP ${res.statusCode}`);
            }
            resolve();
         });
      }).on("error", (e) => {
         console.error(`[FAIL] Request error for ${slug}:`, e.message);
         resolve();
      });
    });
  }
  
  console.log(`Finished: ${successCount}/${slugs.length} successful`);
}
run();
