import { ObjectId } from 'mongodb';
import { getDb } from '../_lib/db.js';
import { route, readBody, HttpError, noStore, publicCache } from '../_lib/http.js';
import { isAdmin, requireAdmin } from '../_lib/auth.js';
import { sanitizeProduct, validateProduct, normalizeInventory } from '../_lib/product.js';
import { destroyImages } from '../_lib/cloudinary.js';

// Accepts a Mongo _id (admin screens) or a slug (public URLs).
function byIdOrSlug(id) {
  return /^[a-f0-9]{24}$/i.test(id) ? { _id: new ObjectId(id) } : { slug: String(id) };
}

async function loadOr404(col, id) {
  const doc = await col.findOne(byIdOrSlug(id));
  if (!doc) throw new HttpError(404, 'Product not found.');
  return doc;
}

async function update(req, res) {
  requireAdmin(req);
  noStore(res);
  const col = (await getDb()).collection('products');
  const existing = await loadOr404(col, req.query.id);
  const submitted = sanitizeProduct(readBody(req));
  const merged = normalizeInventory({ ...existing, ...submitted });
  const changes = { ...submitted, sizeType: merged.sizeType, sizes: merged.sizes };
  validateProduct(merged);
  const updated = await col.findOneAndUpdate(
    { _id: existing._id },
    { $set: { ...changes, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  // Remove photos that were taken off the product from Cloudinary.
  if (changes.images) {
    const kept = new Set(changes.images.map((i) => i.publicId));
    destroyImages((existing.images || []).map((i) => i.publicId).filter((id) => id && !kept.has(id)));
  }
  res.status(200).json(updated);
}

export default route({
  async GET(req, res) {
    const col = (await getDb()).collection('products');
    const doc = await loadOr404(col, req.query.id);
    const admin = req.headers['x-admin-key'] !== undefined && isAdmin(req);
    if (doc.status !== 'published' && !admin) throw new HttpError(404, 'Product not found.');
    admin ? noStore(res) : publicCache(res, 30);
    res.status(200).json(doc);
  },
  PATCH: update,
  PUT: update,
  async DELETE(req, res) {
    requireAdmin(req);
    noStore(res);
    const col = (await getDb()).collection('products');
    const existing = await loadOr404(col, req.query.id);
    await col.deleteOne({ _id: existing._id });
    await destroyImages((existing.images || []).map((i) => i.publicId));
    res.status(200).json({ deleted: true });
  },
});
