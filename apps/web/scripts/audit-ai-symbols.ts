import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import { Blog } from "../src/lib/models/Blog";

const SYMBOLS = [
  { char: "—", name: "EM DASH", code: "U+2014", isPattern: false },
  { char: "–", name: "EN DASH", code: "U+2013", isPattern: false },
  { char: "…", name: "HORIZONTAL ELLIPSIS", code: "U+2026", isPattern: false },
  { char: "###", name: "H3 Pattern", code: "N/A", isPattern: true },
  { char: "---", name: "HR Pattern", code: "N/A", isPattern: true },
  { char: "***", name: "HR Asterisk", code: "N/A", isPattern: true },
  { char: "___", name: "HR Underscore", code: "N/A", isPattern: true },
];

const FIELDS_TO_CHECK = ["title", "content", "markdown", "excerpt", "seoTitle", "seoDescription", "seoKeywords"];

async function runAudit() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB for Forensic Audit.");

  const blogs = await Blog.find().lean();
  
  const report: any = {
    totalBlogs: blogs.length,
    affectedBlogsCount: 0,
    symbolFrequency: {},
    affectedFields: {},
    snippets: []
  };

  for (const s of SYMBOLS) {
    report.symbolFrequency[s.name] = { count: 0, affectedBlogs: 0, char: s.char, code: s.code };
  }
  for (const f of FIELDS_TO_CHECK) {
    report.affectedFields[f] = 0;
  }

  const affectedBlogSet = new Set();

  for (const blog of blogs) {
    let blogAffected = false;
    const blogDoc: any = blog;

    for (const field of FIELDS_TO_CHECK) {
      if (!blogDoc[field]) continue;
      
      const text = typeof blogDoc[field] === "string" ? blogDoc[field] : (Array.isArray(blogDoc[field]) ? blogDoc[field].join(" ") : "");
      let fieldAffected = false;

      for (const s of SYMBOLS) {
        let count = 0;
        let index = text.indexOf(s.char);
        while (index !== -1) {
          count++;
          if (report.snippets.length < 50) {
            const start = Math.max(0, index - 20);
            const end = Math.min(text.length, index + s.char.length + 20);
            report.snippets.push({
              symbol: s.name,
              field: field,
              slug: blogDoc.slug,
              snippet: text.substring(start, end).replace(/\n/g, "\\n")
            });
          }
          index = text.indexOf(s.char, index + s.char.length);
        }

        if (count > 0) {
          report.symbolFrequency[s.name].count += count;
          report.symbolFrequency[s.name].affectedBlogs += 1;
          blogAffected = true;
          fieldAffected = true;
        }
      }

      if (fieldAffected) {
        report.affectedFields[field] += 1;
      }
    }

    if (blogAffected) {
      affectedBlogSet.add(blogDoc._id.toString());
    }
  }

  report.affectedBlogsCount = affectedBlogSet.size;

  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

runAudit().catch(console.error);
