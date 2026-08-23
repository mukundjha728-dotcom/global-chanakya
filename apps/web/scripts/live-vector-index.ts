import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { MongoClient } from "mongodb";

async function createLiveVectorIndex() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("intelligenceevents");

    console.log("=== Creating Live Vector Index ===");

    // We will create the Search Index definition using the MongoDB Atlas Atlas Search API or the native driver
    const indexDef = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 384,
            similarity: "cosine"
          },
          {
            type: "filter",
            path: "status"
          },
          {
            type: "filter",
            path: "category"
          }
        ]
      }
    };

    try {
      const result = await collection.createSearchIndex(indexDef);
      console.log(`Successfully created Live Vector Index. Name: ${result}`);
      console.log("Note: It may take a few minutes for Atlas to fully build the index.");
    } catch (err: any) {
      if (err.message && err.message.includes("already exists")) {
        console.log("Vector index already exists. Skipping creation.");
      } else {
        throw err;
      }
    }
  } finally {
    await client.close();
    process.exit(0);
  }
}

createLiveVectorIndex().catch(console.error);
