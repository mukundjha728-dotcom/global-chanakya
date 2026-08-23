import { performance } from "perf_hooks";

async function measureRoute(url: string, iterations: number = 20) {
  const times: number[] = [];
  let successful = 0;
  console.log(`\nTesting ${url} (${iterations} iterations)...`);
  
  // Wait a bit to avoid DDoS blocking
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      // Bypassing cache to measure actual backend latency
      const res = await fetch(url, { 
        headers: { 
          "Cache-Control": "no-cache", 
          "Pragma": "no-cache",
        },
        cache: 'no-store'
      });
      const end = performance.now();
      
      if (res.ok) {
        times.push(end - start);
        successful++;
      } else {
        console.error(`  - Iteration ${i+1} failed with status: ${res.status}`);
      }
    } catch (err) {
      console.error(`  - Iteration ${i+1} failed:`, err);
    }
    await sleep(200); // 200ms delay between requests to be polite
  }

  if (times.length === 0) return null;

  times.sort((a, b) => a - b);
  const min = times[0];
  const max = times[times.length - 1];
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const p50 = times[Math.floor(times.length * 0.50)];
  const p75 = times[Math.floor(times.length * 0.75)];
  const p95 = times[Math.floor(times.length * 0.95)] || max;

  return { min, avg, p50, p75, p95, max, successful };
}

async function run() {
  const baseUrl = "http://localhost:3000";
  console.log(`=== RUNNING PRODUCTION PERFORMANCE AUDIT ===`);
  console.log(`Target: ${baseUrl}`);

  const routes = [
    `${baseUrl}/`,
    `${baseUrl}/live`,
    `${baseUrl}/intelligence`,
    `${baseUrl}/api/intelligence/timeline`
  ];

  for (const route of routes) {
    const result = await measureRoute(route, 20);
    if (result) {
      console.log(`\nResults for ${route}:`);
      console.log(`  Min:  ${result.min.toFixed(2)} ms`);
      console.log(`  Avg:  ${result.avg.toFixed(2)} ms`);
      console.log(`  P50:  ${result.p50.toFixed(2)} ms`);
      console.log(`  P75:  ${result.p75.toFixed(2)} ms`);
      console.log(`  P95:  ${result.p95.toFixed(2)} ms`);
      console.log(`  Max:  ${result.max.toFixed(2)} ms`);
      console.log(`  Success Rate: ${result.successful}/20`);
    }
  }
}

run().catch(console.error);
