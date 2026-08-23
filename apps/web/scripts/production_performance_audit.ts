import { performance } from "perf_hooks";

async function measureRoute(url: string, iterations: number = 5) {
  const times: number[] = [];
  let successful = 0;
  console.log(`\nTesting ${url} (${iterations} iterations)...`);
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
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
  }

  if (times.length === 0) return null;

  times.sort((a, b) => a - b);
  const min = times[0];
  const max = times[times.length - 1];
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)] || max;

  return { min, avg, p50, p95, max, successful };
}

async function run() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  console.log(`=== RUNNING PERFORMANCE AUDIT ===`);
  console.log(`Target: ${baseUrl}`);
  console.log(`Note: Local measurements may not fully reflect Vercel production cold starts, but will accurately reflect blocking backend latency.`);

  const routes = [
    `${baseUrl}/`,
    `${baseUrl}/live`,
    `${baseUrl}/intelligence`,
    `${baseUrl}/api/intelligence/timeline`
  ];

  for (const route of routes) {
    const result = await measureRoute(route, 5);
    if (result) {
      console.log(`\nResults for ${route}:`);
      console.log(`  Min:  ${result.min.toFixed(2)} ms`);
      console.log(`  Avg:  ${result.avg.toFixed(2)} ms`);
      console.log(`  P50:  ${result.p50.toFixed(2)} ms`);
      console.log(`  P95:  ${result.p95.toFixed(2)} ms`);
      console.log(`  Max:  ${result.max.toFixed(2)} ms`);
      console.log(`  Success Rate: ${result.successful}/5`);
      
      if (result.p50 > 800) {
        console.log(`  ⚠️ WARNING: Median TTFB is > 800ms (${result.p50.toFixed(2)}ms). Further optimization required.`);
      } else {
        console.log(`  ✅ TTFB is within acceptable limits (< 800ms).`);
      }
    }
  }
}

run().catch(console.error);
