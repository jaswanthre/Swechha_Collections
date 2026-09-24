// Local API server: runs the exact same files Vercel deploys from /api.
import 'dotenv/config';
import express from 'express';
import productsIndex from './api/products/index.js';
import productById from './api/products/[id].js';
import settings from './api/settings.js';
import uploadSignature from './api/upload-signature.js';
import adminVerify from './api/admin/verify.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

const withParams = (handler) => (req, res) => {
  req.query = { ...req.query, ...req.params };
  return handler(req, res);
};

app.all('/api/products', withParams(productsIndex));
app.all('/api/products/:id', withParams(productById));
app.all('/api/settings', withParams(settings));
app.all('/api/upload-signature', withParams(uploadSignature));
app.all('/api/admin/verify', withParams(adminVerify));
app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown API route.' }));

const port = process.env.API_PORT || 3001;
app.listen(port, () => console.log(`API ready on http://localhost:${port}`));
