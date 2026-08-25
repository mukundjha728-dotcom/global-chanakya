import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Blog } from "../src/lib/models/Blog";
import { sanitizeInternalCitations } from "../src/lib/utils/contentSanitizer";

dotenv.config({ path: ".env.local" });

async function migrate() {
  const isExecute = process.argv.includes("--execute");

  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log(`Connected to MongoDB. Mode: ${isExecute ? "EXECUTE" : "DRY-RUN"}`);

  // Fetch blogs that contain the artifact string structurally
  const affectedBlogs = await Blog.find({
    $or: [
      { content: { $regex: /:antCitation/ } },
      { markdown: { $regex: /:antCitation/ } }
    ]
  });

  const totalAffected = affectedBlogs.length;
  const publishedAffected = affectedBlogs.filter(b => b.status === "published").length;
  const draftAffected = affectedBlogs.filter(b => b.status === "draft").length;

  console.log(`\n============================`);
  console.log(`Total Affected: ${totalAffected}`);
  console.log(`Published Affected: ${publishedAffected}`);
  console.log(`Draft Affected: ${draftAffected}`);
  console.log(`============================\n`);

  if (totalAffected === 0) {
    console.log("No contaminated documents found. Exiting.");
    process.exit(0);
  }

  // Preview arrays
  const previews: string[] = [];

  // Backup array
  const backupDocs: any[] = [];

  for (const blog of affectedBlogs) {
    backupDocs.push(blog.toObject());
    
    let isContentAffected = false;
    let isMarkdownAffected = false;

    const originalContent = blog.content || "";
    const originalMarkdown = blog.markdown || "";

    const sanitizedContent = sanitizeInternalCitations(originalContent);
    const sanitizedMarkdown = sanitizeInternalCitations(originalMarkdown);

    if (originalContent !== sanitizedContent) isContentAffected = true;
    if (originalMarkdown !== sanitizedMarkdown) isMarkdownAffected = true;

    if (!isContentAffected && !isMarkdownAffected) {
      continue; // false positive from regex
    }

    console.log(`[ID: ${blog._id}] Slug: ${blog.slug} | Status: ${blog.status}`);
    console.log(`  Affected Fields: ${isContentAffected ? "content " : ""}${isMarkdownAffected ? "markdown " : ""}`);
    
    if (isContentAffected) {
      // Find a snippet for preview
      const matchIndex = originalContent.indexOf(":antCitation");
      const start = Math.max(0, matchIndex - 40);
      const end = Math.min(originalContent.length, matchIndex + 80);
      
      const sanitizedSnippet = sanitizeInternalCitations(originalContent.substring(start, end));
      console.log(`  Preview (Content BEFORE): ...${originalContent.substring(start, end)}...`);
      console.log(`  Preview (Content AFTER) : ...${sanitizedSnippet}...`);
    }

    if (isExecute) {
      blog.content = sanitizedContent;
      blog.markdown = sanitizedMarkdown;
      // We use .save() so it runs through the Mongoose hooks
      await blog.save();
    }
  }

  if (isExecute) {
    // Save backup just before completing
    const backupPath = path.join(__dirname, `../../backups/affected-blogs-backup-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify(backupDocs, null, 2));
    console.log(`\n✅ Migration executed. Backup saved to ${backupPath}.`);
  } else {
    console.log(`\n⚠️ DRY-RUN COMPLETE. No data was modified.`);
    console.log(`Run with --execute to apply changes.`);
  }

  process.exit(0);
}

migrate().catch(console.error);
