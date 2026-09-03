import { MongoClient, ObjectId } from 'mongodb';
import * as crypto from 'crypto';

const MONGODB_URI = "mongodb+srv://chanakya_admin:chanakya%40123@cluster0.qacfv4h.mongodb.net/global_chanakya?appName=Cluster0";
const ADMIN_EMAIL = "mukundjha728@gmail.com";
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING REAL E2E ENDPOINT VERIFICATION ===");
  
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("global_chanakya");
    
    // 1. Find Admin User
    const adminUser = await db.collection("users").findOne({ email: ADMIN_EMAIL });
    if (!adminUser) {
      throw new Error(`Admin user ${ADMIN_EMAIL} not found in DB`);
    }
    console.log(`[AUTH] Found admin user: ${adminUser._id}`);

    // 2. Create a Mock Session
    const sessionToken = crypto.randomUUID();
    const expires = new Date();
    expires.setDate(expires.getDate() + 1); // 1 day from now
    
    await db.collection("sessions").insertOne({
      sessionToken,
      userId: adminUser._id,
      expires
    });
    console.log(`[AUTH] Created mock NextAuth session in DB`);

    const headers = {
      "Cookie": `authjs.session-token=${sessionToken}`,
      "Content-Type": "application/json"
    };

    // TEST 6: UNAUTHENTICATED SECURITY
    console.log("\n--- TEST 6: UNAUTHENTICATED SECURITY ---");
    const unauthRun = await fetch(`${BASE_URL}/api/admin/intelligence/run`, { method: "POST" });
    console.log(`POST /api/admin/intelligence/run (No Auth) -> Status: ${unauthRun.status}`);
    const unauthAsk = await fetch(`${BASE_URL}/api/intelligence/ask`, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Test" })
    });
    console.log(`POST /api/intelligence/ask (No Auth) -> Status: ${unauthAsk.status}`);
    
    if (unauthRun.status !== 401 || unauthAsk.status !== 401) {
      throw new Error("Security vulnerability: Unauthenticated endpoints did not return 401!");
    }
    console.log("PASS: Unauthenticated requests correctly blocked.");

    // TEST 1: MANUAL TRIGGER
    console.log("\n--- TEST 1 & 4: MANUAL TRIGGER & CONCURRENT CLICK ---");
    console.log("Triggering intelligence run...");
    
    // Fire the first request but don't await its completion yet (so we can test concurrency)
    const runPromise1 = fetch(`${BASE_URL}/api/admin/intelligence/run`, { method: "POST", headers });
    
    // Wait a brief moment to let the lock acquire, then fire second request
    await new Promise(r => setTimeout(r, 500));
    const runPromise2 = fetch(`${BASE_URL}/api/admin/intelligence/run`, { method: "POST", headers });

    const [res1, res2] = await Promise.all([runPromise1, runPromise2]);
    console.log(`Run Request 1 -> Status: ${res1.status}`);
    console.log(`Run Request 2 -> Status: ${res2.status}`);
    
    const body2 = await res2.json();
    console.log(`Run Request 2 Body:`, body2);

    if (res1.status !== 200 && res1.status !== 202) {
      console.error(await res1.text());
      throw new Error(`Run Request 1 failed with status ${res1.status}`);
    }
    
    if (res2.status !== 429) {
      throw new Error("Concurrency lock failed! Second request did not return 429.");
    }
    console.log("PASS: Manual trigger started and concurrency lock is working.");

    // TEST 2 & 3: EXECUTION STATISTICS AND DATABASE STATE
    console.log("\n--- TEST 2 & 3: EXECUTION STATISTICS & STATE POLLING ---");
    let isRunning = true;
    let finalStats = null;
    let pollCount = 0;
    
    while (isRunning && pollCount < 120) { // Max 120 seconds
      await new Promise(r => setTimeout(r, 2000));
      pollCount += 2;
      
      const statusRes = await fetch(`${BASE_URL}/api/admin/intelligence/status`, { headers });
      const statusData = await statusRes.json();
      
      console.log(`[${pollCount}s] Status: ${statusData.status}, Processed: ${statusData.processed}, Published: ${statusData.published}`);
      
      if (statusData.status === "IDLE" || statusData.status === "COMPLETED") {
        isRunning = false;
        finalStats = statusData;
      }
    }
    
    if (isRunning) {
      throw new Error("Pipeline timed out or didn't return to IDLE.");
    }
    
    console.log("Final Execution Statistics:", finalStats);
    console.log("PASS: Pipeline successfully completed and generated actual stats.");

    // TEST 5: ASK CHANAKYA REGRESSION
    console.log("\n--- TEST 5: ASK CHANAKYA REGRESSION ---");
    const askRes = await fetch(`${BASE_URL}/api/intelligence/ask`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: "What would a prolonged Iran crisis mean for India?" })
    });
    
    console.log(`POST /api/intelligence/ask -> Status: ${askRes.status}`);
    if (askRes.status !== 200) {
      console.error(await askRes.text());
      throw new Error("Ask Chanakya endpoint failed!");
    }
    const askBody = await askRes.json();
    console.log(`Ask Chanakya Response snippet:`, askBody.data?.directAssessment?.substring(0, 100) + "...");
    console.log("PASS: Ask Chanakya returned successfully.");

    // Cleanup Mock Session
    await db.collection("sessions").deleteOne({ sessionToken });
    console.log("\n[AUTH] Cleaned up mock session.");

  } catch (err) {
    console.error("\nTEST FAILED:", err);
  } finally {
    await client.close();
    console.log("=== END VERIFICATION ===");
  }
}

runTests();
