import mongoose from "mongoose";
import dotenv from "dotenv";
import { Blog } from "../src/lib/models/Blog";

dotenv.config({ path: ".env.local" });

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB for verification.\n");

  const affectedBlogs = await Blog.find({
    $or: [
      { content: { $regex: /:antCitation/ } },
      { markdown: { $regex: /:antCitation/ } }
    ]
  }).lean();

  const totalAffected = affectedBlogs.length;
  const publishedAffected = affectedBlogs.filter(b => b.status === "published").length;
  const draftAffected = affectedBlogs.filter(b => b.status === "draft").length;

  console.log("=== FINAL VERIFICATION RESULT ===");
  console.log(`Remaining Contaminated Documents: ${totalAffected}`);
  console.log(`- In 'published' state: ${publishedAffected}`);
  console.log(`- In 'draft' state: ${draftAffected}`);
  
  if (totalAffected > 0) {
    console.error(`\n❌ VERIFICATION FAILED: Found ${totalAffected} documents that still contain internal citation artifacts.`);
    process.exit(1);
  }

  console.log(`\n✅ VERIFICATION PASSED: Zero internal citation artifacts detected in both content and markdown fields across all blog statuses.`);
  process.exit(0);
}

verify().catch(console.error);
