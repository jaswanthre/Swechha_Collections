import { timingSafeEqual } from 'node:crypto';
import { HttpError } from './http.js';

export function adminKeyRequired() {
  return Boolean(process.env.ADMIN_KEY);
}

/** True when the request carries the correct x-admin-key (or no key is configured). */
export function isAdmin(req) {
  const expected = process.env.ADMIN_KEY;
  if (!expected) return true;
  const given = String(req.headers['x-admin-key'] || '');
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function requireAdmin(req) {
  if (!isAdmin(req)) throw new HttpError(401, 'Admin key is missing or incorrect.');
}
