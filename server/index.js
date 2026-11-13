import express from 'express';

import authRoutes, { attachUser } from './auth.js';
import entityRoutes from './entities.js';
import functionRoutes from './functions.js';
import placeholderRoutes from './placeholders.js';
import { initStore } from './store.js';
import uploadRoutes from './uploads.js';

initStore();

// The storefront may be hosted on another origin (e.g. GitHub Pages) than this
// API. `CORS_ORIGINS` is a comma-separated allowlist; a `*` inside an entry
// matches any characters (e.g. `https://*.github.io`). Unset → no CORS headers,
// which keeps the single-origin setup (frontend dev server proxies /api).
const CORS_ORIGINS = String(process.env.CORS_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

function corsOriginAllowed(origin) {
  return CORS_ORIGINS.some((pattern) => {
    if (pattern === '*') return true;
    if (!pattern.includes('*')) return pattern === origin;
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`).test(origin);
  });
}

function corsHeaders(req, res, next) {
  const origin = req.get('origin');
  if (!origin || !corsOriginAllowed(origin)) return next();
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Credentials', 'true');
  res.vary('Origin');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.set('Access-Control-Allow-Headers', req.get('access-control-request-headers') || 'Content-Type, Authorization, X-Base44-App-Url');
    res.set('Access-Control-Max-Age', '600');
    return res.status(204).end();
  }
  return next();
}

const app = express();
// Behind the preview proxy and any reverse proxy in front of a deployed API.
app.set('trust proxy', true);
app.use(express.json({ limit: '10mb' }));
app.use(corsHeaders);
app.use(attachUser);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api', placeholderRoutes);
app.use('/api', uploadRoutes);
app.use('/api', authRoutes);
app.use('/api', entityRoutes);
app.use('/api', functionRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: { message: 'Not found' } }));

app.use((error, _req, res, _next) => {
  console.error('[api] unhandled error:', error);
  res.status(500).json({ error: { message: error.message || 'Server error' } });
});

const port = Number(process.env.PORT || 8000);
app.listen(port, '0.0.0.0', () => console.log(`[api] listening on http://0.0.0.0:${port}`));
