import { config } from "dotenv";
config({ path: ".env.local" });
import dbConnect from "../src/lib/mongoose";
import { Blog } from "../src/lib/models/Blog";
import { ragIndexerService } from "../src/modules/intelligence/services/ragIndexer.service";

async function seedRag() {
  await dbConnect();
  
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ ERROR: OPENAI_API_KEY is missing from environment. Cannot run embeddings.");
    process.exit(1);
  }

  const blogs = await Blog.find({ status: "published" }).select("_id title slug");
  console.log(`Found ${blogs.length} published blogs to index.`);

  let totalChunks = 0;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < blogs.length; i++) {
    const b = blogs[i];
    process.stdout.write(`[${i+1}/${blogs.length}] Indexing ${b.slug}... `);
    
    try {
      const result = await ragIndexerService.indexBlog(b._id);
      if (result.success) {
        console.log(`✅ ${result.chunks} chunks`);
        totalChunks += result.chunks;
        successCount++;
      } else {
        console.log(`❌ Failed: ${result.error}`);
        failCount++;
      }
    } catch (error: any) {
      console.log(`❌ Crashed: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n========== RAG INDEXING COMPLETE ==========`);
  console.log(`Total Blogs Processed: ${blogs.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total Chunks Generated: ${totalChunks}`);
  process.exit(0);
}

seedRag().catch(console.error);
