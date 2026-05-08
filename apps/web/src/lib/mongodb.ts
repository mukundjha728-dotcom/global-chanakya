import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 20000,
  serverSelectionTimeoutMS: 8000,
  maxConnecting: 3,
};

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!uri) {
  // During build time, MONGODB_URI may not be available.
  clientPromise = new Promise((_, reject) =>
    reject(new Error('Missing environment variable: "MONGODB_URI"'))
  );
} else if (process.env.NODE_ENV === "development") {
  // In development, reuse the global connection across hot reloads
  if (!global.__mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global.__mongoClientPromise = client.connect();
  }
  clientPromise = global.__mongoClientPromise;
} else {
  // In production (Vercel): use a module-level singleton
  // so the same connection is reused across invocations in the same container
  if (!global.__mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global.__mongoClientPromise = client.connect();
  }
  clientPromise = global.__mongoClientPromise;
}

export default clientPromise;
