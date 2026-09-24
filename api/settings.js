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
    res.status(200).json({ ...DEFAULT_SETTINGS, ...rest });
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
