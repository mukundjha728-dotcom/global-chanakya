import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { MongoClient } from "mongodb";

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("intelligenceevents");

    console.log("Polling index status on intelligenceevents...");
    
    let isReady = false;
    let attempts = 0;
    while (!isReady && attempts < 30) { // Up to 5 minutes (30 * 10s)
      attempts++;
      const cursor = collection.listSearchIndexes();
      const indexes = await cursor.toArray();

      let found = false;
      for (const idx of indexes) {
        if (idx.name === "vector_index") {
          found = true;
          console.log(`[Attempt ${attempts}] Index status: ${idx.status}`);
          if (idx.status === "READY") {
            isReady = true;
          }
        }
      }
      
      if (!found) {
        console.log(`[Attempt ${attempts}] vector_index not found yet...`);
      }

      if (!isReady) {
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    if (isReady) {
      console.log("READY");
      process.exit(0);
    } else {
      console.log("NOT_READY");
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}
run();
