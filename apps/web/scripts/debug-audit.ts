import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import dbConnect from "../src/lib/mongoose";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

async function main() {
  await dbConnect();
  
  // 1. Get the latest event
  const realEvent = await IntelligenceEvent.findOne({ status: "published" }).sort({ publishedAt: -1 }).lean();
  console.log("Latest DB Event:", realEvent?.slug, realEvent?.publishedAt);

  // 2. Hit the API
  const apiRes = await fetch("http://localhost:3000/api/intelligence/timeline");
  const apiData = await apiRes.json();
  
  console.log("API Timeline Length:", apiData.data?.length);
  if (apiData.data?.length > 0) {
    console.log("Top API Event:", apiData.data[0].id, apiData.data[0].timestamp);
  }

  // 3. Try to hit the detail page directly
  const detailRes = await fetch(`http://localhost:3000/intelligence/${realEvent?.slug}`);
  console.log("Detail Page Status:", detailRes.status);
  const html = await detailRes.text();
  console.log("Contains title?", html.includes(realEvent?.title as string));
  console.log("Contains Classified?", html.includes("Classified Document"));
  
  process.exit(0);
}
main();
