export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.expose = true;
  }
}

export function readBody(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === 'string') {
    try {
      return JSON.parse(b);
    } catch {
      throw new HttpError(400, 'Request body is not valid JSON.');
    }
  }
  return b;
}

/** Method router + consistent JSON errors for every function. */
export function route(handlers) {
  return async (req, res) => {
    const handler = handlers[req.method];
    if (!handler) {
      res.setHeader('Allow', Object.keys(handlers).join(', '));
      return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }
    try {
      await handler(req, res);
    } catch (e) {
      if (!e.expose) console.error(e);
      if (e.code === 11000) {
        const field = Object.keys(e.keyPattern || {})[0] || 'field';
        return res.status(409).json({ error: `Another product already uses this ${field === 'code' ? 'product code' : field}.` });
      }
      res.status(e.status || 500).json({
        error: e.expose ? e.message : 'The server could not complete the request. Try again in a moment.',
      });
    }
  };
}

export function noStore(res) {
  res.setHeader('Cache-Control', 'no-store');
}

export function publicCache(res, seconds = 30) {
  res.setHeader('Cache-Control', `public, s-maxage=${seconds}, stale-while-revalidate=300`);
}
