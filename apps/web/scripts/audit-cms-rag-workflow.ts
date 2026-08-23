import mongoose from "mongoose";
import { Blog } from "../src/lib/models/Blog";
import { BlogChunk } from "../src/lib/models/BlogChunk";
import { SystemConfig } from "../src/lib/models/SystemConfig";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";
import { BlogService } from "../src/modules/blog/services/blog.service";
import { ragIndexerService } from "../src/modules/intelligence/services/ragIndexer.service";
import * as dotenv from "dotenv";
import crypto from "crypto";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

async function getCorpusVersions() {
  const config = await SystemConfig.findOne();
  return {
    ragCorpusVersion: config?.ragCorpusVersion || 1,
    liveCorpusVersion: config?.liveCorpusVersion || 1
  };
}

async function checkBlogState(blogId: string, stepName: string) {
  console.log(`\n--- State after: ${stepName} ---`);
  const blog = await Blog.findById(blogId);
  const chunks = await BlogChunk.find({ blogId }).sort({ chunkIndex: 1 });
  const versions = await getCorpusVersions();
  
  console.log(`Blog Status: ${blog?.status || "NOT FOUND"}`);
  console.log(`Blog Exists: ${!!blog}`);
  console.log(`BlogChunk Count: ${chunks.length}`);
  if (chunks.length > 0) {
    console.log(`Sample contentHash: ${chunks[0].contentHash}`);
    console.log(`chunkIndexes: ${chunks.map(c => c.chunkIndex).join(", ")}`);
    console.log(`Dimensions (384 expected): ${chunks[0].embedding?.length || 0}`);
  }
  console.log(`RAG Corpus Version: ${versions.ragCorpusVersion}`);
  console.log(`Live Corpus Version: ${versions.liveCorpusVersion}`);
}

async function auditWorkflow() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected.");

  const testTitle = `Audit CMS RAG Lifecycle ${crypto.randomBytes(4).toString("hex")}`;
  let blogId: string | null = null;
  const initialVersions = await getCorpusVersions();
  console.log(`\nInitial RAG Corpus Version: ${initialVersions.ragCorpusVersion}`);

  try {
    // 1. DRAFT -> SAVE
    console.log("\n>>> 1. Creating Draft (Save)");
    const blog = await BlogService.createBlog({
      title: testTitle,
      slug: testTitle.toLowerCase().replace(/ /g, "-"),
      excerpt: "Testing CMS integration...",
      content: "This is a test blog for RAG integration lifecycle. It contains enough content to hopefully be embedded, but since it's a draft it shouldn't be.",
      category: "Test",
      status: "draft",
      author: new mongoose.Types.ObjectId(), // Fake author
    });
    blogId = (blog._id as any).toString();
    // Simulate what the API does for drafts - normally it skips RAG sync or calls sync that ignores non-published.
    await checkBlogState(blogId!, "Draft Save");

    // 2. PUBLISH
    console.log("\n>>> 2. Publishing");
    await BlogService.updateBlog(blogId!, { status: "published" });
    await ragIndexerService.indexBlog(blogId!);
    await checkBlogState(blogId!, "Publish");

    // 3. EDIT (Published)
    console.log("\n>>> 3. Editing Published Blog");
    await BlogService.updateBlog(blogId!, { content: "Updated content for the test blog. This should change the hash and trigger re-embedding of the chunk." });
    await ragIndexerService.indexBlog(blogId!);
    await checkBlogState(blogId!, "Edit Published");

    // 4. UNPUBLISH (Draft)
    console.log("\n>>> 4. Unpublishing (back to Draft)");
    await BlogService.updateBlog(blogId!, { status: "draft" });
    await ragIndexerService.unindexBlog(blogId!);
    await checkBlogState(blogId!, "Unpublish");

    // 5. REPUBLISH
    console.log("\n>>> 5. Republishing");
    await BlogService.updateBlog(blogId!, { status: "published" });
    await ragIndexerService.indexBlog(blogId!);
    await checkBlogState(blogId!, "Republish");

    // 6. DELETE
    console.log("\n>>> 6. Deleting");
    // API route calls: BlogService.deleteBlog(id), then ragIndexerService.unindexBlog(id)
    await BlogService.deleteBlog(blogId!);
    await ragIndexerService.unindexBlog(blogId!);
    await checkBlogState(blogId!, "Delete");

    // Check for orphan/ghost chunks
    const orphans = await BlogChunk.countDocuments({ blogId });
    console.log(`\nOrphan chunks after delete: ${orphans}`);

  } catch (err) {
    console.error("\nERROR during audit:", err);
  } finally {
    if (blogId) {
      console.log(`\nCleanup Fallback...`);
      await Blog.findByIdAndDelete(blogId);
      await BlogChunk.deleteMany({ blogId });
    }
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

auditWorkflow();
