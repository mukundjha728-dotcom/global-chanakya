import * as https from 'https';

async function measureUrl(url: string, iterations = 20, forceMiss = false) {
  let min = Infinity;
  let max = -Infinity;
  let total = 0;
  let successCount = 0;
  const times: number[] = [];
  let lastHeaders: any = {};

  const agent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false
  });

  console.log(`\nTesting ${url} (${iterations} iterations) [Force MISS: ${forceMiss}]...`);

  // Warmup
  try {
    const warmupOpts: any = { agent };
    if (forceMiss) {
       warmupOpts.headers = { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };
    }
    await fetch(url, warmupOpts);
  } catch (e) {}

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      const opts: any = { agent };
      if (forceMiss) {
        opts.headers = { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };
      }
      const res = await fetch(url, opts);
      const end = performance.now();

      if (res.ok) {
        const duration = end - start;
        times.push(duration);
        total += duration;
        if (duration < min) min = duration;
        if (duration > max) max = duration;
        successCount++;
        lastHeaders = {
          'x-vercel-cache': res.headers.get('x-vercel-cache') || 'NOT_PRESENT',
          'x-vercel-id': res.headers.get('x-vercel-id') || 'NOT_PRESENT'
        };
      }
    } catch (error) {
      console.error(`Request failed:`, error);
    }
    
    // Small delay between requests to not trigger DDoS protection
    await new Promise(r => setTimeout(r, 100));
  }

  times.sort((a, b) => a - b);
  const p50 = times[Math.floor(times.length * 0.5)] || 0;
  const p75 = times[Math.floor(times.length * 0.75)] || 0;
  const p95 = times[Math.floor(times.length * 0.95)] || 0;
  const avg = successCount > 0 ? total / successCount : 0;

  console.log(`Results for ${url} [Force MISS: ${forceMiss}]:`);
  console.log(`  Min:  ${min.toFixed(2)} ms`);
  console.log(`  Avg:  ${avg.toFixed(2)} ms`);
  console.log(`  P50:  ${p50.toFixed(2)} ms`);
  console.log(`  P75:  ${p75.toFixed(2)} ms`);
  console.log(`  P95:  ${p95.toFixed(2)} ms`);
  console.log(`  Max:  ${max.toFixed(2)} ms`);
  console.log(`  Success Rate: ${successCount}/${iterations}`);
  console.log(`  Headers (last request):`);
  console.log(`    x-vercel-cache: ${lastHeaders['x-vercel-cache']}`);
  console.log(`    x-vercel-id: ${lastHeaders['x-vercel-id']}`);
}

async function run() {
  const baseUrl = process.argv[2] || "http://localhost:3000";
  console.log(`=== RUNNING PHASE 6.6 REALITY AUDIT ===`);
  console.log(`Target: ${baseUrl}`);

  const endpoints = [
    `${baseUrl}/`,
    `${baseUrl}/live`,
    `${baseUrl}/intelligence`,
    `${baseUrl}/api/intelligence/timeline`
  ];

  console.log("\n--- TEST 1: WARM CACHE (Normal Visitor) ---");
  for (const url of endpoints) {
    await measureUrl(url, 20, false);
  }

  console.log("\n--- TEST 2: COLD BACKEND (Force Cache Miss) ---");
  for (const url of endpoints) {
    await measureUrl(url, 10, true);
  }
}

run().catch(console.error);
