import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { intelligenceService } from '../src/modules/intelligence/services/intelligence.service';
import dbConnect from '../src/lib/mongoose';

const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-70b-8192", // Fallback alternative
  "openai/gpt-oss-120b" // Current
];

const BENCHMARK_QUERIES = [
  "What is the impact of China's BRI on India?",
  "Analyze the current semiconductor supply chain risks.",
  "Evaluate defense partnerships between the US and India.",
];

async function runBenchmark() {
  await dbConnect();
  
  console.log("Starting Groq Model Benchmark...");
  
  const results: any[] = [];
  
  for (const model of MODELS) {
    process.env.GROQ_DEFAULT_MODEL = model;
    console.log(`\n=== Benchmarking Model: ${model} ===`);
    
    let totalLatency = 0;
    let totalIn = 0;
    let totalOut = 0;
    let successCount = 0;
    
    for (let i = 0; i < BENCHMARK_QUERIES.length; i++) {
      const q = BENCHMARK_QUERIES[i];
      console.log(`  Query ${i+1}: ${q.substring(0, 40)}...`);
      
      const t0 = performance.now();
      try {
        const result = await intelligenceService.askChanakya(q);
        const t1 = performance.now();
        
        const latency = t1 - t0;
        totalLatency += latency;
        totalIn += result.usage?.prompt_tokens || 0;
        totalOut += result.usage?.completion_tokens || 0;
        successCount++;
        
        console.log(`    -> SUCCESS: ${latency.toFixed(0)}ms | In: ${result.usage?.prompt_tokens} | Out: ${result.usage?.completion_tokens}`);
        
        // Sleep to avoid rate limits
        await new Promise(r => setTimeout(r, 4000));
      } catch (err: any) {
        console.log(`    -> FAILED: ${err.message}`);
        await new Promise(r => setTimeout(r, 6000));
      }
    }
    
    if (successCount > 0) {
      results.push({
        Model: model,
        AvgLatency: Math.round(totalLatency / successCount),
        AvgInput: Math.round(totalIn / successCount),
        AvgOutput: Math.round(totalOut / successCount),
        SuccessRate: `${successCount}/${BENCHMARK_QUERIES.length}`
      });
    } else {
      results.push({
        Model: model,
        AvgLatency: "-",
        AvgInput: "-",
        AvgOutput: "-",
        SuccessRate: `0/${BENCHMARK_QUERIES.length}`
      });
    }
  }
  
  console.log("\n=== BENCHMARK RESULTS ===");
  console.table(results);
  
  process.exit(0);
}

runBenchmark().catch(console.error);
