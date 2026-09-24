// Usage:  npm run seed          → adds sample products that don't exist yet (matched by code)
//         npm run seed:reset    → deletes ALL products first, then adds the samples
import 'dotenv/config';
import { getDb } from '../api/_lib/db.js';
import { PRODUCT_DEFAULTS } from '../api/_lib/product.js';
import { DEFAULT_SETTINGS } from '../api/_lib/settings.js';
import { SEED_PRODUCTS } from './seed-data.js';

const reset = process.argv.includes('--reset');

try {
  const db = await getDb();
  const col = db.collection('products');
  if (reset) {
    const { deletedCount } = await col.deleteMany({});
    console.log(`Removed ${deletedCount} products.`);
  }
  let added = 0;
  const base = Date.now();
  for (const [i, p] of SEED_PRODUCTS.entries()) {
    const at = new Date(base - i * 60_000);
    const r = await col.updateOne(
      { code: p.code },
      { $setOnInsert: { ...PRODUCT_DEFAULTS, ...p, status: 'published', displayOrder: 0, createdAt: at, updatedAt: at } },
      { upsert: true }
    );
    if (r.upsertedCount) added++;
  }
  await db.collection('settings').updateOne({ _id: 'site' }, { $setOnInsert: DEFAULT_SETTINGS }, { upsert: true });
  console.log(`Added ${added} sample products (${SEED_PRODUCTS.length - added} already existed). Settings ready.`);
  process.exit(0);
} catch (e) {
  console.error('Seed failed:', e.message);
  process.exit(1);
}
