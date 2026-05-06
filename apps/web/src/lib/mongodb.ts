import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let clientPromise: Promise<MongoClient>;

if (uri) {
  let client;

  if (process.env.NODE_ENV === "development") {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // During build time, MONGODB_URI may not be available.
  // The promise will reject if actually awaited without a valid URI.
  clientPromise = new Promise((_, reject) => {
    reject(new Error('Invalid/Missing environment variable: "MONGODB_URI"'));
  });
}

export default clientPromise;
