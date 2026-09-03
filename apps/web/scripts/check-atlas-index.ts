import { config } from "dotenv";
config({ path: ".env.local", override: true });
import dbConnect from "../src/lib/mongoose";
import { BlogChunk } from "../src/lib/models/BlogChunk";

async function checkIndex() {
  await dbConnect();
  
  try {
    const indexes = await BlogChunk.collection.listSearchIndexes().toArray();
    console.log(JSON.stringify(indexes, null, 2));
    
    const vectorIndex = indexes.find(idx => idx.name === "vector_index");
    if (!vectorIndex) {
      console.log("❌ 'vector_index' is MISSING.");
      process.exit(1);
    }
    
    console.log(`Status: ${(vectorIndex as any).status}`);
    if ((vectorIndex as any).status !== "READY") {
      console.log("❌ 'vector_index' is NOT READY.");
      process.exit(1);
    }
    
    console.log("✅ 'vector_index' is present and READY.");
    process.exit(0);
  } catch (e: any) {
    console.error("Error fetching search indexes:", e.message);
    process.exit(1);
  }
}

checkIndex().catch(console.error);
