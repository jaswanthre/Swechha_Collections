import { getDb } from './_lib/db.js';
import { route, readBody, noStore, publicCache } from './_lib/http.js';
import { requireAdmin } from './_lib/auth.js';
import { DEFAULT_SETTINGS, sanitizeSettings } from './_lib/settings.js';

export default route({
  async GET(req, res) {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ _id: 'site' });
    publicCache(res, 60);
    const { _id, ...rest } = doc || {};
    const settings = { ...DEFAULT_SETTINGS, ...rest };
    settings.categories = (settings.categories || DEFAULT_SETTINGS.categories).filter(
      (category) => category.key?.toLowerCase() !== 'bamboo night dresses' && category.label?.toLowerCase() !== 'bamboo night dresses'
    );
    res.status(200).json(settings);
  },
  async PUT(req, res) {
    requireAdmin(req);
    noStore(res);
    const db = await getDb();
    const data = sanitizeSettings(readBody(req));
    await db.collection('settings').updateOne({ _id: 'site' }, { $set: { ...data, updatedAt: new Date() } }, { upsert: true });
    res.status(200).json(data);
  },
});
