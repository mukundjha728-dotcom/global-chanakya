import https from 'https';

function measureUrl(url: string, iterations: number = 20): Promise<any> {
  return new Promise(async (resolve) => {
    console.log(`\nTesting ${url} (${iterations} iterations)...`);
    const timings: number[] = [];
    let successCount = 0;
    
    // warm up
    try {
      await fetch(url);
    } catch(e) {}

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      try {
        const req = https.request(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache', // force bypass CDN edge cache if possible to measure backend
            'Pragma': 'no-cache'
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            const end = performance.now();
            timings.push(end - start);
            successCount++;
            if (i === iterations - 1) {
              timings.sort((a, b) => a - b);
              const min = timings[0];
              const max = timings[timings.length - 1];
              const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
              const p50 = timings[Math.floor(timings.length * 0.5)];
              const p75 = timings[Math.floor(timings.length * 0.75)];
              const p95 = timings[Math.floor(timings.length * 0.95)];
              
              console.log(`Results for ${url}:`);
              console.log(`  Min:  ${min.toFixed(2)} ms`);
              console.log(`  Avg:  ${avg.toFixed(2)} ms`);
              console.log(`  P50:  ${p50.toFixed(2)} ms`);
              console.log(`  P75:  ${p75.toFixed(2)} ms`);
              console.log(`  P95:  ${p95.toFixed(2)} ms`);
              console.log(`  Max:  ${max.toFixed(2)} ms`);
              console.log(`  Success Rate: ${successCount}/${iterations}`);
              
              // Try to print headers from the last request to see Vercel Cache Status
              console.log(`  Headers (last request):`);
              console.log(`    x-vercel-cache: ${res.headers['x-vercel-cache'] || 'MISSING'}`);
              console.log(`    x-vercel-id: ${res.headers['x-vercel-id'] || 'MISSING'}`);
              resolve(null);
            }
          });
        });
        
        req.on('error', (err) => {
          console.error(`Request ${i} failed:`, err.message);
          if (i === iterations - 1) resolve(null);
        });
        
        req.end();
      } catch (err: any) {
        console.error(`Request ${i} failed:`, err.message);
        if (i === iterations - 1) resolve(null);
      }
      
      // small delay between requests
      await new Promise(r => setTimeout(r, 200));
    }
  });
}

async function run() {
  const baseUrl = "https://www.globalchanakya.in";
  console.log(`=== RUNNING PRODUCTION LATENCY BASELINE (PHASE 6.6) ===`);
  console.log(`Target: ${baseUrl}`);

  await measureUrl(`${baseUrl}/`);
  await measureUrl(`${baseUrl}/live`);
  await measureUrl(`${baseUrl}/intelligence`);
  await measureUrl(`${baseUrl}/api/intelligence/timeline`);
}

run().catch(console.error);
