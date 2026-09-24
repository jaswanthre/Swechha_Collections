import { route, HttpError, noStore } from './_lib/http.js';
import { requireAdmin } from './_lib/auth.js';
import { cloudinaryConfig, sign } from './_lib/cloudinary.js';

// Returns a short-lived signature so the browser can upload straight to Cloudinary
// without the API secret ever leaving the server.
export default route({
  async POST(req, res) {
    requireAdmin(req);
    noStore(res);
    const cfg = cloudinaryConfig();
    if (!cfg) {
      throw new HttpError(503, 'Photo upload is not set up. Add the CLOUDINARY_* keys to your environment, or paste an image link instead.');
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const params = { folder: cfg.folder, timestamp };
    res.status(200).json({
      cloudName: cfg.cloudName,
      apiKey: cfg.apiKey,
      folder: cfg.folder,
      timestamp,
      signature: sign(params, cfg.apiSecret),
    });
  },
});
