import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import dbConnect from "../src/lib/mongoose";
import { redis } from "../src/lib/redis";
import { Blog } from "../src/lib/models/Blog";
import { BlogPublishingRun } from "../src/lib/models/BlogPublishingRun";
import { User } from "../src/lib/models/User";
import mongoose from "mongoose";

async function diagnose() {
  console.log("=== PUBLISHING PIPELINE DIAGNOSTIC ===");
  const flagVal = process.env.BLOG_PUBLISHING_ENABLED;
  const modelVal = process.env.GROQ_DEFAULT_MODEL;
  const tavilyVal = process.env.TAVILY_API_KEY;
  const authorIdVal = process.env.SYSTEM_BLOG_AUTHOR_ID;
  console.log("BLOG_PUBLISHING_ENABLED:", flagVal);
  console.log("GROQ_DEFAULT_MODEL:", modelVal);
  console.log("TAVILY_API_KEY:", tavilyVal ? "configured" : "MISSING");
  console.log("SYSTEM_BLOG_AUTHOR_ID:", authorIdVal || "MISSING");

  await dbConnect();
  console.log("\n[MongoDB] connected");

  try {
    const pong = await (redis as any).ping();
    console.log("[Redis] ping:", pong);
  } catch(e: any) {
    console.log("[Redis] FAILED:", e.message);
  }

  try {
    const lock = await redis.get("publishing:engine:lock");
    console.log("[Lock] publishing:engine:lock =", lock ?? "FREE");
  } catch(e: any) {
    console.log("[Lock] check failed:", e.message);
  }

  if (authorIdVal && mongoose.Types.ObjectId.isValid(authorIdVal)) {
    const author = await User.findById(authorIdVal).select("name email role").lean() as any;
    if (author) {
      console.log("[Author] FOUND:", author.name, author.email, "role:", author.role);
    } else {
      console.log("[Author] NOT FOUND IN DB for id:", authorIdVal);
    }
  } else {
    console.log("[Author] INVALID or MISSING SYSTEM_BLOG_AUTHOR_ID");
  }

  const filter = { status: "published", contentType: { $ne: "platform-seo" } };
  const cats = await Blog.distinct("category", filter);
  const validCats = cats.filter(Boolean);
  console.log("[Categories]", validCats.length > 0 ? validCats.join(", ") : "NONE - engine will throw 'No active categories'");

  const total = await Blog.countDocuments();
  const published = await Blog.countDocuments({ status: "published" });
  console.log("[Blogs] total:", total, "published:", published);

  const lastRun = await BlogPublishingRun.findOne().sort({ createdAt: -1 }).lean() as any;
  if (lastRun) {
    console.log("[LastRun]", lastRun.runId, "| status:", lastRun.status, "| isDryRun:", lastRun.isDryRun);
    for (const r of (lastRun.categoryResults || [])) {
      const errSnip = r.error ? " ERROR: " + String(r.error).substring(0, 150) : "";
      console.log("  [" + r.status + "]", r.category, errSnip);
    }
  } else {
    console.log("[LastRun] No runs found");
  }

  await mongoose.disconnect();
  process.exit(0);
}

diagnose().catch(e => { console.error("CRASHED:", e.message); process.exit(1); });
