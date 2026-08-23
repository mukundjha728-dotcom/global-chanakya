import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { generateEmbeddings } from "../src/lib/ai/embeddings";
import { findLiveSemanticMatches } from "../src/lib/ai/vectorSearch";
import dbConnect from "../src/lib/mongoose";

async function run() {
  console.log("=== LIVE VECTOR TEST ===");
  await dbConnect();
  
  const query = "What is happening with international diplomacy and the UN?";
  console.log(`Query: ${query}`);
  
  const embedding = await generateEmbeddings(query);
  const matches = await findLiveSemanticMatches(embedding, 3, 0.4);
  
  if (matches.length > 0) {
    console.log(`[PASS] Found ${matches.length} matches.`);
    matches.forEach(m => console.log(`- Score: ${m.score.toFixed(3)} | Title: ${m.title}`));
  } else {
    console.error("[FAIL] Vector search returned no matches. (Check if Atlas index is built)");
    process.exit(1);
  }
  process.exit(0);
}
run();
