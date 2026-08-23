import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { intelligenceService } from '../src/modules/intelligence/services/intelligence.service';
import dbConnect from '../src/lib/mongoose';

async function runModes() {
  await dbConnect();
  
  const query = "What is the global impact of the United States elections?";
  
  console.log("=== INTERNAL MODE ===");
  const internal = await intelligenceService.askChanakya(query, undefined, 'INTERNAL');
  console.log(`Internal Usage:`, internal.usage);
  
  console.log("\n=== LIVE MODE ===");
  const live = await intelligenceService.askChanakya(query, undefined, 'LIVE');
  console.log(`Live Usage:`, live.usage);
  
  console.log("\n=== HYBRID MODE ===");
  const hybrid = await intelligenceService.askChanakya(query, undefined, 'HYBRID');
  console.log(`Hybrid Usage:`, hybrid.usage);
  
  process.exit(0);
}

runModes();
