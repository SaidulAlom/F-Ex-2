import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Cached connection so serverless invocations reuse the socket.
 * In dev, Next's HMR would otherwise open a new pool on every reload.
 */
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalForMongo = globalThis as unknown as { _fexMongo?: Cache };
const cached: Cache = globalForMongo._fexMongo ?? { conn: null, promise: null };
globalForMongo._fexMongo = cached;

export async function dbConnect(): Promise<typeof mongoose> {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not set — see .env.example');
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

/** True when a DB is configured; pages can render marketing fallbacks otherwise. */
export const hasDb = () => Boolean(MONGODB_URI);
