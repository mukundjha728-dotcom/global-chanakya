import mongoose from "mongoose";
import dotenv from "dotenv";
import { Blog } from "../src/lib/models/Blog";

dotenv.config({ path: ".env.local" });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB");

  const total = await Blog.countDocuments();
  const affected = await Blog.countDocuments({
    content: { $regex: /:antCitation/ }
  });
  const affectedPublished = await Blog.countDocuments({
    content: { $regex: /:antCitation/ },
    status: "published"
  });
  const affectedDraft = await Blog.countDocuments({
    content: { $regex: /:antCitation/ },
    status: "draft"
  });

  const affectedMarkdown = await Blog.countDocuments({
    markdown: { $regex: /:antCitation/ }
  });

  console.log(`Total blogs: ${total}`);
  console.log(`Affected blogs (content): ${affected}`);
  console.log(`Affected blogs (published): ${affectedPublished}`);
  console.log(`Affected blogs (draft): ${affectedDraft}`);
  console.log(`Affected blogs (markdown): ${affectedMarkdown}`);

  process.exit(0);
}

check().catch(console.error);
