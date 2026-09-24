import { route, noStore } from '../_lib/http.js';
import { adminKeyRequired, isAdmin } from '../_lib/auth.js';

export default route({
  // GET → does this deployment need a key at all?
  async GET(req, res) {
    noStore(res);
    res.status(200).json({ required: adminKeyRequired() });
  },
  // POST with x-admin-key → is the key correct?
  async POST(req, res) {
    noStore(res);
    res.status(isAdmin(req) ? 200 : 401).json({ ok: isAdmin(req) });
  },
});
