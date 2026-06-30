import fs from 'fs';
import path from 'path';

// Run using Node.js: node apps/web/scripts/load-test.mjs <target_url> <test_user_id> <test_blog_slug>

const TARGET_URL = process.argv[2] || "http://localhost:3000";
const TEST_SLUG = process.argv[4] || "demo-article";
const CONCURRENCY = 100;

async function runLikeSpam() {
  console.log(`\n🚀 Starting Like Spam Test (${CONCURRENCY} concurrent requests)...`);
  const promises = [];
  
  for (let i = 0; i < CONCURRENCY; i++) {
    promises.push(fetch(`${TARGET_URL}/api/blogs/${TEST_SLUG}/like`, {
      method: "POST",
      // Fake cookie/headers normally needed, but we will test rate-limiter on IP mostly
      headers: {
        "x-forwarded-for": "127.0.0.1",
      }
    }));
  }

  const results = await Promise.all(promises);
  const statusCounts = {};
  for (const r of results) {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  }

  console.log("Like Spam Results:", statusCounts);
  if (statusCounts[429]) {
    console.log("✅ Rate limiter successfully blocked some requests.");
  } else if (statusCounts[401]) {
    console.log("✅ Auth barrier successful.");
  }
}

async function runInjectionTesting() {
  console.log(`\n🚀 Starting Injection Testing...`);
  
  // Fake slug
  let res = await fetch(`${TARGET_URL}/api/blogs/drop_database_123/like`, { method: "POST" });
  console.log(`Fake Slug Result: ${res.status} (Expected 404/400)`);
  
  // Large payload
  res = await fetch(`${TARGET_URL}/api/blogs/${TEST_SLUG}/view`, { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isPing: true, progressPercentage: "x".repeat(500000) })
  });
  console.log(`Large Payload Result: ${res.status} (Expected 413 or 400/500 reject)`);
}

async function main() {
  await runLikeSpam();
  await runInjectionTesting();
  console.log("\n✅ Load Testing Framework Executed.");
}

main().catch(console.error);
