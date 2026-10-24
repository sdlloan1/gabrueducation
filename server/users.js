'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { DATA_DIR } = require('./paths');
const { httpError } = require('./http');

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ROLES = ['admin', 'editor'];

function readAll() {
  try {
    const list = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    return Array.isArray(list) ? list : [];
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`[users] could not read users.json: ${error.message}`);
    }
    return [];
  }
}

function saveAll(list) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${USERS_FILE}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(list, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, USERS_FILE);
}

/** The shape the API and the console are allowed to see — never the hash. */
function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active !== false,
    createdAt: user.createdAt
  };
}

function findByEmail(email) {
  const wanted = String(email || '').trim().toLowerCase();
  if (!wanted) return null;
  return readAll().find((user) => String(user.email).toLowerCase() === wanted) || null;
}

function findById(id) {
  return readAll().find((user) => user.id === id) || null;
}

function count() {
  return readAll().length;
}

/** Newest first. */
function list() {
  return readAll()
    .slice()
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    .map(publicUser);
}

function countActiveAdmins() {
  return readAll().filter((user) => user.role === 'admin' && user.active !== false).length;
}

function create({ name, email, passwordHash, role }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (findByEmail(cleanEmail)) {
    throw httpError(409, 'An account with that email already exists.');
  }

  const user = {
    id: crypto.randomUUID(),
    name: String(name || '').trim(),
    email: cleanEmail,
    role: ROLES.includes(role) ? role : 'editor',
    active: true,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  saveAll([...readAll(), user]);
  return user;
}

function update(id, patch) {
  const list = readAll();
  const index = list.findIndex((user) => user.id === id);
  if (index === -1) return null;

  const next = { ...list[index] };
  if (patch.name !== undefined) next.name = patch.name;
  if (patch.role !== undefined) next.role = patch.role;
  if (patch.active !== undefined) next.active = patch.active;
  if (patch.passwordHash !== undefined) next.passwordHash = patch.passwordHash;

  list[index] = next;
  saveAll(list);
  return next;
}

function remove(id) {
  const list = readAll();
  const next = list.filter((user) => user.id !== id);
  if (next.length === list.length) return false;
  saveAll(next);
  return true;
}

module.exports = {
  ROLES,
  USERS_FILE,
  publicUser,
  findByEmail,
  findById,
  count,
  list,
  countActiveAdmins,
  create,
  update,
  remove
};
