import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import { Blog } from "../src/lib/models/Blog";

async function verify() {
  console.log("Starting DB Verification...");
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB.");

  const blogs = await Blog.find().lean();
  let failed = 0;
  
  for (const blog of blogs) {
    const b: any = blog;
    const fieldsToCheck = [b.title, b.excerpt, b.content, b.markdown, b.seo?.title, b.seo?.description, (b.seo?.keywords || []).join(" ")];

    for (const field of fieldsToCheck) {
      if (typeof field === "string") {
        if (field.includes("—") || field.includes("–") || field.includes(":antCitation")) {
           // We expect 0 prohibited characters.
           // However, EN DASH might be legitimately converted to `-`. The EM DASH is converted to ` - `.
           // If we find `—` or `–` or `:antCitation`, we fail.
           console.error(`Validation failed for blog: ${b.slug}`);
           failed++;
           break;
        }
      }
    }
  }

  console.log(`\nVerification Complete.`);
  if (failed === 0) {
    console.log(`SUCCESS: 0 prohibited AI-generated symbols in published blogs.`);
  } else {
    console.log(`FAILED: ${failed} blogs still contain prohibited artifacts.`);
  }
  process.exit(0);
}

verify().catch(console.error);
