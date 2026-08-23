import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

dotenv.config({ path: ".env.local" });

async function auditCronAndGroq() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB");

  const events = await IntelligenceEvent.find().sort({ createdAt: -1 }).limit(10);
  console.log("\n=== RECENT EVENTS TIMESTAMP ===");
  events.forEach(e => {
    console.log(`- ${e.title.substring(0,30)}... | created: ${e.createdAt}`);
  });

  // Now let's test Groq directly via API
  console.log("\n=== GROQ RUNTIME (Ask Chanakya) ===");
  try {
    const startTime = Date.now();
    const res = await fetch("http://localhost:3000/api/intelligence/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass dev-secret as auth header for internal endpoints maybe?
        // Wait, Ask Chanakya uses NextAuth or public?
      },
      body: JSON.stringify({
        query: "What is the latest update on China?",
        mode: "LIVE"
      })
    });
    const latency = Date.now() - startTime;
    console.log(`Status: ${res.status}`);
    console.log(`Latency: ${latency}ms`);
    if (!res.ok) {
      console.log(`Error Response:`, await res.text());
    } else {
      const data = await res.json();
      console.log(`Success! Mode: ${data.mode || 'LIVE'}`);
      console.log(`Answer length: ${data.answer?.length || 0}`);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }

  await mongoose.disconnect();
}

auditCronAndGroq();
