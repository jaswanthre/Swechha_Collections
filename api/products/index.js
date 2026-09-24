import { getDb } from '../_lib/db.js';
import { route, readBody, noStore, publicCache } from '../_lib/http.js';
import { requireAdmin } from '../_lib/auth.js';
import { sanitizeProduct, validateProduct, PRODUCT_DEFAULTS, slugify } from '../_lib/product.js';

const SORT = { displayOrder: 1, createdAt: -1 };

async function uniqueSlug(col, base) {
  let slug = base;
  for (let i = 2; await col.findOne({ slug }, { projection: { _id: 1 } }); i++) slug = `${base}-${i}`;
  return slug;
}

export default route({
  // GET /api/products            → published products (public)
  // GET /api/products?all=1      → every product incl. drafts (admin key required)
  async GET(req, res) {
    const db = await getDb();
    const wantAll = req.query?.all === '1';
    if (wantAll) {
      requireAdmin(req);
      noStore(res);
    } else {
      publicCache(res, 30);
    }
    const filter = wantAll ? {} : { status: 'published' };
    const products = await db.collection('products').find(filter).sort(SORT).limit(500).toArray();
    res.status(200).json(products);
  },

  // POST /api/products → create (admin)
  async POST(req, res) {
    requireAdmin(req);
    noStore(res);
    const db = await getDb();
    const col = db.collection('products');
    const data = { ...PRODUCT_DEFAULTS, ...sanitizeProduct(readBody(req)) };
    validateProduct(data);
    const now = new Date();
    const doc = { ...data, slug: await uniqueSlug(col, slugify(data.name)), createdAt: now, updatedAt: now };
    const { insertedId } = await col.insertOne(doc);
    res.status(201).json({ ...doc, _id: insertedId });
  },
});

