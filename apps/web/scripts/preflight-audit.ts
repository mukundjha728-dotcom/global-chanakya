import { config } from "dotenv";
config({ path: ".env.local", override: true });
import mongoose from "mongoose";
import { Blog } from "../src/lib/models/Blog";
import { BlogChunk } from "../src/lib/models/BlogChunk";
import { MarkdownSplitter } from "../src/lib/ai/textSplitter";
import dbConnect from "../src/lib/mongoose";

async function preflight() {
  await dbConnect();
  const db = mongoose.connection.db;
  if (!db) throw new Error("No DB");
  
  console.log("Connected to MongoDB.");

  interface MongoSearchIndex {
    name: string;
    status: string;
    latestDefinition?: {
      fields?: Array<{
        numDimensions?: number;
        similarity?: string;
      }>;
    };
  }

  // Check vector index
  const indexes = await db.collection("blogchunks").listSearchIndexes().toArray() as unknown as MongoSearchIndex[];
  const vectorIndex = indexes.find(i => i.name === "vector_index");
  if (!vectorIndex) {
    throw new Error("vector_index is missing on blogchunks collection");
  }
  if (vectorIndex.status !== "READY") {
    throw new Error("vector_index is not READY. Status: " + vectorIndex.status);
  }
  const dims = vectorIndex.latestDefinition?.fields?.[0]?.numDimensions;
  const sim = vectorIndex.latestDefinition?.fields?.[0]?.similarity;
  
  console.log(`Vector Index: READY, dims: ${dims}, sim: ${sim}`);
  if (dims !== 384 || sim !== "cosine") {
    throw new Error("Invalid vector index configuration");
  }

  // Audit blogs
  const publishedBlogs = await Blog.find({ status: "published" });
  console.log(`Total Published Blogs: ${publishedBlogs.length}`);
  
  const chunks = await BlogChunk.find({});
  const chunkMap = new Map();
  chunks.forEach(c => {
    const bId = c.blogId.toString();
    if (!chunkMap.has(bId)) chunkMap.set(bId, []);
    chunkMap.get(bId).push(c);
  });
  
  let fullyIndexed = 0;
  let partialOrStale = 0;
  let missing = 0;

  for (const blog of publishedBlogs) {
    const cList = chunkMap.get(blog._id.toString());
    if (!cList || cList.length === 0) {
      missing++;
      continue;
    }
    
    // Check if fully indexed (compare hash and embeddings)
    const contentToHash = `${blog.title}\n${blog.content}`;
    let newHash = "";
    if (blog.keyInsights && blog.keyInsights.length > 0) {
      newHash = MarkdownSplitter.generateHash(contentToHash + `\n\n## Key Insights\n${blog.keyInsights.join("\n")}`);
    } else {
      newHash = MarkdownSplitter.generateHash(contentToHash);
    }
    
    // Wait, the existing pilot used keyInsights in the hash or not?
    // In ragIndexer.service.ts, the hash is generated from `${blog.title}\n${blog.content}` BEFORE keyInsights are appended.
    // Let me check ragIndexer.service.ts line 23: `const newHash = MarkdownSplitter.generateHash(contentToHash);`
    
    const exactHash = MarkdownSplitter.generateHash(`${blog.title}\n${blog.content}`);
    
    const isFullyIndexed = cList.every((c: any) => 
      c.contentHash === exactHash && 
      c.embeddingModel === "Xenova/all-MiniLM-L6-v2" && 
      c.embeddingDimensions === 384 &&
      c.embedding.length === 384
    );

    if (isFullyIndexed) {
      fullyIndexed++;
    } else {
      partialOrStale++;
    }
  }

  console.log(`Fully Indexed: ${fullyIndexed}`);
  console.log(`Missing: ${missing}`);
  console.log(`Partial/Stale: ${partialOrStale}`);
  
  if (publishedBlogs.length !== 167) {
    console.error("WARNING: Expected 167 published blogs, got " + publishedBlogs.length);
  }
  
  mongoose.connection.close();
}

preflight().catch(err => {
  console.error("PREFLIGHT FAILED:", err);
  process.exit(1);
});
