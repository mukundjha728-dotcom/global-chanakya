import { config } from "dotenv";
config({ path: ".env.local", override: true });
import dbConnect from "../src/lib/mongoose";
import { BlogChunk } from "../src/lib/models/BlogChunk";

async function updateIndexes() {
  await dbConnect();
  
  const collection = BlogChunk.collection;
  const indexes = await collection.indexes();
  
  console.log("Current indexes:", indexes.map(i => i.name));
  
  // Find old index
  const oldIndex = indexes.find(i => i.name === "blogId_1_chunkIndex_1" || (i.key.blogId === 1 && i.key.chunkIndex === 1 && Object.keys(i.key).length === 2));
  
  if (oldIndex && oldIndex.name) {
    console.log(`Dropping old index: ${oldIndex.name}`);
    await collection.dropIndex(oldIndex.name);
  }
  
  console.log("Creating new index: { blogId: 1, contentHash: 1, chunkIndex: 1 } (unique)");
  await collection.createIndex(
    { blogId: 1, contentHash: 1, chunkIndex: 1 },
    { unique: true, name: "blogId_contentHash_chunkIndex_unique" }
  );
  
  console.log("Indexes updated successfully.");
  process.exit(0);
}

updateIndexes().catch(err => {
  console.error(err);
  process.exit(1);
});
