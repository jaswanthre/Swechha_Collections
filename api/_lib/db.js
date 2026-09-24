import { MongoClient } from 'mongodb';

// Re-use one connection across warm serverless invocations.
const g = globalThis;

async function ensureIndexes(db) {
  await Promise.all([
    db.collection('products').createIndex({ slug: 1 }, { unique: true }),
    db.collection('products').createIndex({ code: 1 }, { unique: true }),
    db.collection('products').createIndex({ status: 1, displayOrder: 1, createdAt: -1 }),
  ]);
}

export async function getDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    const err = new Error('MONGO_URI is not set. Add it to .env (local) or Vercel → Settings → Environment Variables.');
    err.status = 500;
    err.expose = true;
    throw err;
  }
  if (!g.__swechhaMongo) {
    const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 10000 });
    g.__swechhaMongo = client
      .connect()
      .then(async (c) => {
        const db = c.db(process.env.MONGO_DB || undefined);
        await ensureIndexes(db);
        return db;
      })
      .catch((e) => {
        g.__swechhaMongo = null; // allow retry on next request
        throw e;
      });
  }
  return g.__swechhaMongo;
}
