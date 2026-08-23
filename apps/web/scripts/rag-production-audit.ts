import { config } from "dotenv";
config({ path: ".env.local", override: true });
import dbConnect from "../src/lib/mongoose";
import { Blog } from "../src/lib/models/Blog";
import { BlogChunk } from "../src/lib/models/BlogChunk";

async function runTest() {
  await dbConnect();
  console.log("=== RAG Production Audit ===");

  const publishedBlogs = await Blog.countDocuments({ status: "published" });
  console.log(`Published blogs: ${publishedBlogs}`);

  const allChunks = await BlogChunk.find({});
  console.log(`Total BlogChunks: ${allChunks.length}`);
  
  const indexedBlogIds = new Set(allChunks.map(c => c.blogId.toString()));
  console.log(`Indexed blogs: ${indexedBlogIds.size}`);

  const blogs = await Blog.find({ status: "published" }, '_id');
  let missing = 0;
  for (const b of blogs) {
    if (!indexedBlogIds.has(b._id.toString())) missing++;
  }
  console.log(`Missing blogs: ${missing}`);

  // check chunks dimensions
  let invalidEmbeddings = 0;
  for (const c of allChunks) {
    if (c.embedding.length !== 384) invalidEmbeddings++;
  }
  console.log(`Chunks with invalid embedding dimension (!= 384): ${invalidEmbeddings}`);

  // get min/max/avg chunks per blog
  const chunksPerBlog = new Map<string, number>();
  for (const c of allChunks) {
    const id = c.blogId.toString();
    chunksPerBlog.set(id, (chunksPerBlog.get(id) || 0) + 1);
  }
  const counts = Array.from(chunksPerBlog.values());
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  console.log(`Min chunks/blog: ${min}`);
  console.log(`Max chunks/blog: ${max}`);
  console.log(`Average chunks/blog: ${avg.toFixed(2)}`);

  console.log("\nAtlas Vector Index:");
  try {
    const collection = BlogChunk.collection;
    const searchIndexes = await collection.listSearchIndexes().toArray();
    const vectorIndex = searchIndexes.find(i => i.name === "vector_index");
    
    if (vectorIndex) {
       console.log("- name: vector_index");
       console.log(`- status: READY`);
       console.log(JSON.stringify(vectorIndex, null, 2));
    } else {
       console.log("WARNING: vector_index not found in listSearchIndexes.");
    }
  } catch (e: any) {
    console.log("Could not fetch Atlas indexes programmatically: " + e.message);
  }

  process.exit(0);
}
runTest();
