import { config } from "dotenv";
config({ path: ".env.local" });
import dbConnect from "../src/lib/mongoose";
import { BlogChunk } from "../src/lib/models/BlogChunk";

async function inspect() {
  await dbConnect();
  console.log("=== Inspecting BlogChunk Collection ===");
  
  const total = await BlogChunk.countDocuments();
  console.log(`Total BlogChunks: ${total}`);

  if (total === 0) {
    console.log("Collection is empty. No migration needed.");
    process.exit(0);
  }

  const dim1536 = await BlogChunk.countDocuments({ $expr: { $eq: [{ $size: "$embedding" }, 1536] } });
  const dim384 = await BlogChunk.countDocuments({ $expr: { $eq: [{ $size: "$embedding" }, 384] } });
  const invalid = await BlogChunk.countDocuments({ 
    $or: [
      { embedding: { $exists: false } },
      { embedding: { $size: 0 } },
      { $expr: { $and: [ { $ne: [{ $size: "$embedding" }, 1536] }, { $ne: [{ $size: "$embedding" }, 384] } ] } }
    ]
  });

  console.log(`1536-dimensional chunks (OpenAI): ${dim1536}`);
  console.log(`384-dimensional chunks (Local): ${dim384}`);
  console.log(`Invalid/Missing embeddings: ${invalid}`);

  const models = await BlogChunk.aggregate([
    { $group: { _id: "$embeddingModel", count: { $sum: 1 } } }
  ]);

  console.log("\nEmbedding Model Distribution:");
  models.forEach(m => {
    console.log(`- ${m._id || "Unknown"}: ${m.count}`);
  });

  process.exit(0);
}

inspect().catch(console.error);
