import { config } from "dotenv";
config({ path: ".env.local" });
import dbConnect from "../src/lib/mongoose";
import { findSemanticMatches } from "../src/lib/ai/vectorSearch";
import { generateEmbeddings } from "../src/lib/ai/embeddings";
import { BlogChunk } from "../src/lib/models/BlogChunk";

async function check() {
  await dbConnect();
  
  const count = await BlogChunk.countDocuments();
  console.log(`BlogChunks: ${count}`);

  console.log("Checking GROQ_API_KEY:", process.env.GROQ_API_KEY ? "CONFIGURED" : "MISSING");

  try {
    const embedding = await generateEmbeddings("India diplomacy");
    const results = await findSemanticMatches(embedding, 5, 0.0);
    console.log(`Vector Search Returned: ${results.length} chunks`);
    if (results.length > 0) {
      console.log(`Top match: ${results[0].title} (Score: ${results[0].score})`);
    } else {
      console.log("Still 0 chunks. Atlas Index is not ready, or is configured on the wrong collection (should be 'BlogChunk'), or with the wrong path ('embedding').");
    }
  } catch (e: any) {
    console.error("Vector Search Error:", e.message);
  }
  process.exit(0);
}

check().catch(console.error);
