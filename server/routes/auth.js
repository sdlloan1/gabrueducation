'use strict';

const express = require('express');

const auth = require('../auth');
const users = require('../users');
const { httpError } = require('../http');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_MIN = 8;

/**
 * Who am I? Also tells the console whether the site has been set up yet, so a
 * brand-new installation can show "create the first administrator" instead of a
 * login form nobody can use.
 */
router.get('/me', (req, res) => {
  res.json({
    ok: true,
    user: req.user ? users.publicUser(req.user) : null,
    setupRequired: users.count() === 0
  });
});

/** Creates the very first administrator. Only possible while there are none. */
router.post('/setup', (req, res) => {
  if (users.count() > 0) {
    throw httpError(409, 'This site already has an account — please sign in instead.');
  }

  const { name, email, password } = req.body || {};
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (cleanName.length < 2) throw httpError(400, 'Please enter your name.');
  if (!EMAIL_RE.test(cleanEmail)) throw httpError(400, 'Please enter a valid email address.');
  if (String(password || '').length < PASSWORD_MIN) {
    throw httpError(400, `Passwords need at least ${PASSWORD_MIN} characters.`);
  }

  const user = users.create({
    name: cleanName,
    email: cleanEmail,
    role: 'admin',
    passwordHash: auth.hashPassword(password)
  });

  auth.setSessionCookie(res, auth.createSession(user.id));
  console.log(`[auth] first administrator created: ${user.email}`);
  res.status(201).json({ ok: true, user: users.publicUser(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.findByEmail(email);

  if (!user || user.active === false || !auth.verifyPassword(password, user.passwordHash)) {
    throw httpError(401, 'That email and password do not match.');
  }

  auth.setSessionCookie(res, auth.createSession(user.id));
  console.log(`[auth] ${user.email} signed in`);
  res.json({ ok: true, user: users.publicUser(user) });
});

router.post('/logout', (req, res) => {
  auth.destroySession(auth.readCookie(req, auth.SESSION_COOKIE));
  auth.clearSessionCookie(res);
  res.json({ ok: true });
});

module.exports = router;
