import { config } from "dotenv";
config({ path: ".env.local" });
import { performance } from "perf_hooks";
import { intelligenceService } from "../src/modules/intelligence/services/intelligence.service";

async function runForensics() {
  const query = "What are the major risks to India's strategic autonomy?";
  
  console.log("Measuring direct IntelligenceService latency...");
  
  const start = performance.now();
  try {
    const result = await intelligenceService.askChanakya(query);
    const end = performance.now();
    
    console.log(`Success! Total Service Latency: ${Math.round(end - start)}ms`);
    console.log(`Usage:`, result.usage);
    console.log(`Direct Assessment:`, result.data.directAssessment);
  } catch (error) {
    console.error("Failed:", error);
  }
}

runForensics().catch(console.error);
