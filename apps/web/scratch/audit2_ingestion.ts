import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { LiveIngestionService } from '../src/lib/intelligence/live/ingestion.service';
import dbConnect from '../src/lib/mongoose';

async function runIngestion() {
  await dbConnect();
  const service = new LiveIngestionService();
  
  console.log("=== FIRST RUN ===");
  const stats1 = await service.pollAllProviders();
  console.log(stats1);
  
  console.log("\n=== SECOND RUN (CHECK DUPLICATES) ===");
  const stats2 = await service.pollAllProviders();
  console.log(stats2);
  
  process.exit(0);
}
runIngestion();
