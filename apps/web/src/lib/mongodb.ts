import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;

const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 30000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!uri) {
  clientPromise = Promise.reject(new Error('Missing environment variable: "MONGODB_URI"'));
} else if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = global._mongoClientPromise;
}

export default clientPromise;
