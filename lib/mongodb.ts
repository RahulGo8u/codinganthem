import mongoose from "mongoose";

// Do not throw at import time — Next evaluates API route modules during
// `next build` page-data collection, and Preview/Dependabot builds often
// lack Production secrets. Fail at connectDB() instead.
// Read process.env inside connectDB so we never capture an empty build-time value.

// Cache connection across hot reloads in dev and across serverless invocations
declare global {
  var _mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI ?? "";
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      dbName: "codinganthem",
      bufferCommands: false,
      maxPoolSize: 5,
      // Atlas hostnames publish IPv6 addresses that Vercel functions often
      // cannot reach. Forcing IPv4 avoids a multi-second connect timeout
      // before the driver falls back.
      family: 4,
      // Fail fast and predictably on an outage instead of hanging until
      // Vercel's own function timeout kicks in.
      serverSelectionTimeoutMS: 5_000,
      connectTimeoutMS: 5_000,
      socketTimeoutMS: 10_000,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
