import express from 'express';

import authRoutes, { attachUser } from './auth.js';
import entityRoutes from './entities.js';
import functionRoutes from './functions.js';
import placeholderRoutes from './placeholders.js';
import { initStore } from './store.js';
import uploadRoutes from './uploads.js';

initStore();

const app = express();
app.use(express.json({ limit: '10mb' }));
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
