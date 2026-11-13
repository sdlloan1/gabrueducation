import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import express from 'express';
import multer from 'multer';

import { UPLOAD_DIR } from './store.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').slice(0, 12);
    cb(null, `${Date.now().toString(36)}_${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

function origin(req) {
  const appUrl = req.get('x-base44-app-url');
  if (appUrl) return appUrl.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

router.post(['/integrations/core/upload', '/integrations/core/upload/:visibility'], upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: 'No file uploaded' } });
  const file_uri = `/api/files/${req.file.filename}`;
  res.json({
    file_uri,
    file_url: `${origin(req)}${file_uri}`,
    name: req.file.originalname,
    size: req.file.size,
  });
});

router.get('/files/sign', (req, res) => {
  const file_uri = String(req.query.uri || req.query.file_uri || '');
  if (!file_uri) return res.status(400).json({ error: { message: 'file_uri is required' } });
  res.json({ signed_url: /^https?:\/\//i.test(file_uri) ? file_uri : `${origin(req)}${file_uri}` });
});

router.get('/files/:name', (req, res) => {
  const safe = path.basename(req.params.name);
  const full = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(full)) return res.status(404).json({ error: { message: 'File not found' } });
  res.sendFile(full);
});

// Transactional email is not wired to a provider in this local environment: the
// backend functions log what would have been sent.
router.post('/integrations/core/send-email', (req, res) => {
  console.log(`[email] to ${req.body?.to || '(none)'} :: ${req.body?.subject || '(no subject)'}`);
  res.json({ ok: true });
});

export default router;
