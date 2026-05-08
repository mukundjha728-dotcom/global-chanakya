import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

let cached = global.__mongoose;

if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,          // Keep up to 10 connections open
      minPoolSize: 2,           // Always keep 2 warm
      socketTimeoutMS: 20000,   // Close sockets after 20s inactivity
      serverSelectionTimeoutMS: 8000, // Fail fast if server not found in 8s
      heartbeatFrequencyMS: 10000,    // Check server health every 10s
      maxConnecting: 3,         // Max concurrent connection attempts
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // reset so next request can retry
    throw err;
  }

  return cached.conn;
}

export default dbConnect;
