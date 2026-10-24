'use strict';

const express = require('express');

const content = require('../../lib/content');
const { httpError } = require('../http');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Public enquiry endpoint behind the contact page. Deliberately open: it is the
 * one API route a visitor without an account is meant to use.
 */
router.post('/', (req, res) => {
  const payload = req.body || {};
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim();
  const message = String(payload.message || '').trim();

  if (name.length < 2) throw httpError(400, 'Please tell us your name.');
  if (!EMAIL_RE.test(email)) throw httpError(400, 'Please enter a valid email address.');
  if (message.length < 10) throw httpError(400, 'Please add a short message.');

  content.addMessage({
    name,
    email,
    phone: String(payload.phone || '').trim(),
    interest: String(payload.interest || '').trim(),
    message,
    receivedAt: new Date().toISOString()
  });

  console.log(`[contact] enquiry from ${email}`);
  res.status(201).json({ ok: true });
});

module.exports = router;
