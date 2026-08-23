import { config } from "dotenv";
config({ path: ".env.local", override: true });
import mongoose from "mongoose";
import { Blog } from "../src/lib/models/Blog";
import { BlogChunk } from "../src/lib/models/BlogChunk";
import { MarkdownSplitter } from "../src/lib/ai/textSplitter";
import dbConnect from "../src/lib/mongoose";

async function postAudit() {
  await dbConnect();
  
  const publishedBlogs = await Blog.find({ status: "published" });
  const allChunks = await BlogChunk.find({});
  
  const chunkMap = new Map();
  let malformedEmbeddings = 0;
  let missingMetadata = 0;
  
  const duplicates = new Map();
  let duplicateCount = 0;

  allChunks.forEach(c => {
    // Basic validation
    if (!c.embedding || c.embedding.length !== 384 || c.embeddingModel !== "Xenova/all-MiniLM-L6-v2") {
      malformedEmbeddings++;
    }
    if (!c.blogId || !c.slug || !c.title || c.chunkIndex === undefined || !c.contentHash || !c.content) {
      missingMetadata++;
    }
    
    // Duplicate check
    const dupKey = `${c.blogId.toString()}-${c.contentHash}-${c.chunkIndex}`;
    if (duplicates.has(dupKey)) {
      duplicateCount++;
    } else {
      duplicates.set(dupKey, true);
    }
    
    // Map for blog-level stats
    const bId = c.blogId.toString();
    if (!chunkMap.has(bId)) chunkMap.set(bId, []);
    chunkMap.get(bId).push(c);
  });
  
  let fullyIndexed = 0;
  let partialOrStale = 0;
  let missing = 0;
  
  let maxChunks = -1;
  let minChunks = 999999;

  for (const blog of publishedBlogs) {
    const cList = chunkMap.get(blog._id.toString());
    if (!cList || cList.length === 0) {
      missing++;
      continue;
    }
    
    if (cList.length > maxChunks) maxChunks = cList.length;
    if (cList.length < minChunks) minChunks = cList.length;
    
    const exactHash = MarkdownSplitter.generateHash(`${blog.title}\n${blog.content}`);
    
    const isFullyIndexed = cList.every((c: any) => 
      c.contentHash === exactHash
    );

    if (isFullyIndexed) {
      fullyIndexed++;
    } else {
      partialOrStale++;
    }
  }
  
  if (minChunks === 999999) minChunks = 0;
  const avgChunks = allChunks.length / publishedBlogs.length;

  console.log("=== POST-INDEXING AUDIT ===");
  console.log(`Total Published Blogs: ${publishedBlogs.length}`);
  console.log(`Fully Indexed Blogs: ${fullyIndexed}`);
  console.log(`Missing Blogs: ${missing}`);
  console.log(`Partial/Stale Blogs: ${partialOrStale}`);
  console.log(`Total BlogChunks: ${allChunks.length}`);
  console.log(`Average chunks/blog: ${avgChunks.toFixed(2)}`);
  console.log(`Min chunks/blog: ${minChunks}`);
  console.log(`Max chunks/blog: ${maxChunks}`);
  
  console.log("\n=== DATA INTEGRITY ===");
  console.log(`Malformed Embeddings: ${malformedEmbeddings}`);
  console.log(`Missing Metadata: ${missingMetadata}`);
  console.log(`Unintended Duplicates: ${duplicateCount}`);
  
  mongoose.connection.close();
}

postAudit().catch(e => {
  console.error("Audit failed", e);
  process.exit(1);
});
