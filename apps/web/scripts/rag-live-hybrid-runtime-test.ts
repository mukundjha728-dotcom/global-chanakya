import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { intelligenceService } from '../src/modules/intelligence/services/intelligence.service';
import dbConnect from '../src/lib/mongoose';

async function runRuntimeTest() {
  await dbConnect();
  
  const query = "What are the latest developments in global diplomacy and conflict?";
  
  const modes: Array<'INTERNAL' | 'LIVE' | 'HYBRID'> = ['INTERNAL', 'LIVE', 'HYBRID'];

  for (const mode of modes) {
    console.log(`\n=== RUNNING MODE: ${mode} ===`);
    try {
      const result = await intelligenceService.askChanakya(query, undefined, mode);
      const metrics = result.metadata.latency;
      console.log(`Success: true`);
      console.log(`Internal Retrieved: ${metrics.retrievedChunks}`);
      console.log(`Internal Selected: ${metrics.selectedChunks}`);
      console.log(`Live Retrieved: ${metrics.liveRetrieved || 0}`);
      console.log(`Live Selected: ${metrics.liveSelected || 0}`);
      console.log(`RAG Grounded: ${metrics.ragGrounded}`);
      console.log(`Groq Latency (ms): ${metrics.groq}`);
      console.log(`Total Latency (ms): ${metrics.total}`);
      console.log(`Response Snippet: ${result.data.answer.substring(0, 100)}...`);
    } catch (e: any) {
      console.log(`Success: false`);
      console.log(`Error: ${e.message}`);
      if (e.message.includes("Timeout")) {
        console.log(`Failure Classification: BLOCKED_BY_PROVIDER (Timeout)`);
      } else if (e.message.includes("Rate limit") || e.message.includes("429")) {
        console.log(`Failure Classification: BLOCKED_BY_PROVIDER (Rate Limit)`);
      } else {
        console.log(`Failure Classification: OTHER`);
      }
    }
    
    // Respect Retry-After (sleep briefly between queries to not spam Groq)
    console.log("Sleeping 2 seconds before next query...");
    await new Promise(r => setTimeout(r, 2000));
  }
  
  process.exit(0);
}

runRuntimeTest().catch(console.error);
