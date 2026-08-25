import mongoose from "mongoose";
import dotenv from "dotenv";
import { Blog } from "../src/lib/models/Blog";

dotenv.config({ path: ".env.local" });

async function dumpArtifacts() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB for dumping samples.");

  const affectedBlogs = await Blog.find({
    $or: [
      { content: { $regex: /:antCitation/ } },
      { markdown: { $regex: /:antCitation/ } }
    ]
  }).lean();

  const regex = /:antCitation\[.*?\]\{.*?\}/g;
  let allMatches = new Set<string>();

  for (const blog of affectedBlogs) {
    if (blog.content) {
      const matches = blog.content.match(regex);
      if (matches) matches.forEach(m => allMatches.add(m));
    }
    if (blog.markdown) {
      const matches = blog.markdown.match(regex);
      if (matches) matches.forEach(m => allMatches.add(m));
    }
  }

  console.log(`Found ${allMatches.size} unique antCitation artifacts.`);
  console.log("Samples:");
  allMatches.forEach(m => console.log(m));

  // Also try to find any variation just matching "antCitation"
  const generalRegex = /.{0,10}antCitation.{0,50}/g;
  let allGeneral = new Set<string>();
  for (const blog of affectedBlogs) {
    if (blog.content) {
      const matches = blog.content.match(generalRegex);
      if (matches) matches.forEach(m => allGeneral.add(m));
    }
  }
  
  console.log("\nGeneral context samples:");
  allGeneral.forEach(m => console.log(m));

  process.exit(0);
}

dumpArtifacts().catch(console.error);
