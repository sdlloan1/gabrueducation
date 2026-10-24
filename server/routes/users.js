'use strict';

const express = require('express');

const auth = require('../auth');
const users = require('../users');
const { httpError } = require('../http');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_MIN = 8;

/* Account management is administrator-only. */
router.use(auth.requireRole('admin'));

function cleanPassword(value) {
  const password = String(value || '');
  if (password.length < PASSWORD_MIN) {
    throw httpError(400, `Passwords need at least ${PASSWORD_MIN} characters.`);
  }
  return password;
}

router.get('/', (req, res) => {
  res.json({ ok: true, users: users.list(), roles: users.ROLES });
});

router.post('/', (req, res) => {
  const { name, email, password, role } = req.body || {};
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (cleanName.length < 2) throw httpError(400, 'Please enter the person’s name.');
  if (!EMAIL_RE.test(cleanEmail)) throw httpError(400, 'Please enter a valid email address.');

  const user = users.create({
    name: cleanName,
    email: cleanEmail,
    role,
    passwordHash: auth.hashPassword(cleanPassword(password))
  });

  console.log(`[users] created ${user.email} as ${user.role}`);
  res.status(201).json({ ok: true, user: users.publicUser(user) });
});

router.patch('/:id', (req, res) => {
  const user = users.findById(req.params.id);
  if (!user) throw httpError(404, 'That account no longer exists.');

  const input = req.body || {};
  const patch = {};

  if (input.name !== undefined) {
    const name = String(input.name).trim();
    if (name.length < 2) throw httpError(400, 'Please enter the person’s name.');
    patch.name = name;
  }
  if (input.role !== undefined) {
    if (!users.ROLES.includes(input.role)) throw httpError(400, 'That is not a role we know.');
    patch.role = input.role;
  }
  if (input.active !== undefined) patch.active = Boolean(input.active);
  if (input.password) patch.passwordHash = auth.hashPassword(cleanPassword(input.password));

  const losesAdmin = (patch.role && patch.role !== 'admin') || patch.active === false;
  if (losesAdmin && user.role === 'admin' && user.active !== false && users.countActiveAdmins() <= 1) {
    throw httpError(400, 'At least one active administrator is needed.');
  }
  if (patch.active === false && req.user.id === user.id) {
    throw httpError(400, 'You cannot deactivate your own account.');
  }

  const updated = users.update(user.id, patch);
  console.log(`[users] updated ${updated.email}`);
  res.json({ ok: true, user: users.publicUser(updated) });
});

router.delete('/:id', (req, res) => {
  const user = users.findById(req.params.id);
  if (!user) throw httpError(404, 'That account no longer exists.');
  if (user.id === req.user.id) throw httpError(400, 'You cannot delete your own account.');
  if (user.role === 'admin' && user.active !== false && users.countActiveAdmins() <= 1) {
    throw httpError(400, 'At least one active administrator is needed.');
  }

  users.remove(user.id);
  console.log(`[users] deleted ${user.email}`);
  res.json({ ok: true });
});

module.exports = router;
