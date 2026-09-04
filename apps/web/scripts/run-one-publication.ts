/**
 * Real end-to-end publication test.
 * Calls processNextPublication(isDryRun=false) directly — same code path as the Admin UI button.
 * BLOG_PUBLISHING_ENABLED must be true in .env.local
 */
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import dbConnect from "../src/lib/mongoose";
import { Blog } from "../src/lib/models/Blog";
import { BlogPublishingRun } from "../src/lib/models/BlogPublishingRun";
import { blogPublishingEngine } from "../src/modules/blog/services/blogPublishingEngine.service";
import mongoose from "mongoose";

async function main() {
  console.log("=== REAL END-TO-END PUBLISHING TEST ===");
  console.log("BLOG_PUBLISHING_ENABLED:", process.env.BLOG_PUBLISHING_ENABLED);
  console.log("GROQ_DEFAULT_MODEL:", process.env.GROQ_DEFAULT_MODEL);

  if (process.env.BLOG_PUBLISHING_ENABLED !== "true") {
    console.error("ABORTED: BLOG_PUBLISHING_ENABLED is not true");
    process.exit(1);
  }

  await dbConnect();

  const blogsBeforeCount = await Blog.countDocuments({ isSystemGenerated: true });
  console.log(`System-generated blogs BEFORE: ${blogsBeforeCount}`);

  console.log("\n[Publishing] Starting processNextPublication(isDryRun=false)...");
  const start = Date.now();

  let result: any;
  try {
    result = await blogPublishingEngine.processNextPublication(false);
    console.log(`\n[Publishing] Completed in ${((Date.now() - start)/1000).toFixed(1)}s`);
    console.log("[Publishing] Result:", JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error(`\n[Publishing] FAILED after ${((Date.now() - start)/1000).toFixed(1)}s`);
    console.error("[Publishing] Error:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }

  // Verify blog was created
  const blogsAfterCount = await Blog.countDocuments({ isSystemGenerated: true });
  const newBlogsCount = blogsAfterCount - blogsBeforeCount;
  console.log(`\nSystem-generated blogs AFTER: ${blogsAfterCount}`);
  console.log(`New blogs created this run: ${newBlogsCount}`);

  if (newBlogsCount > 0) {
    const newest = await Blog.findOne({ isSystemGenerated: true })
      .sort({ createdAt: -1 })
      .select("title slug category reportType status author publishAt content")
      .lean() as any;
    if (newest) {
      const wordCount = newest.content ? newest.content.split(/\s+/).length : 0;
      console.log("\n=== PUBLISHED BLOG ===");
      console.log("_id        :", newest._id.toString());
      console.log("title      :", newest.title);
      console.log("slug       :", newest.slug);
      console.log("category   :", newest.category);
      console.log("reportType :", newest.reportType);
      console.log("status     :", newest.status);
      console.log("author     :", newest.author?.toString());
      console.log("publishAt  :", newest.publishAt);
      console.log("word count :", wordCount);
    }
  }

  // Check for duplicate blogs
  const runId = result?.runId;
  if (runId) {
    const run = await BlogPublishingRun.findOne({ runId }).lean() as any;
    if (run) {
      console.log("\n=== RUN SUMMARY ===");
      for (const r of run.categoryResults || []) {
        const errSnip = r.error ? " | error: " + String(r.error).substring(0, 100) : "";
        console.log(`  [${r.status}] ${r.category} | blogId: ${r.blogId || "none"}${errSnip}`);
      }
    }
  }

  // Metrics
  const m = blogPublishingEngine.lastMetrics;
  console.log("\n=== METRICS ===");
  console.log("tavilyCalls           :", m.tavilyCalls);
  console.log("groqCalls             :", m.groqCalls);
  console.log("successfulGroqCalls   :", m.successfulCalls);
  console.log("failedGroqCalls       :", m.failedCalls);
  console.log("retries               :", m.retries);
  console.log("totalEndToEndMs       :", m.totalEndToEndTimeMs);

  console.log("\n=== RESULT ===");
  if (newBlogsCount === 1) {
    console.log("PUBLISHING STATUS: PASS");
    console.log("Blog created        : YES");
    console.log("Duplicate blogs     : NO (exactly 1 new blog)");
  } else if (newBlogsCount === 0) {
    console.log("PUBLISHING STATUS: FAIL");
    console.log("Blog created        : NO");
  } else {
    console.log("PUBLISHING STATUS: WARN");
    console.log(`Blog created        : ${newBlogsCount} (unexpected — check for duplicates)`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e => { console.error("CRASHED:", e.message, e.stack); process.exit(1); });
