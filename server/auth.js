'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { DATA_DIR } = require('./paths');
const users = require('./users');
const { httpError } = require('./http');

const SESSION_COOKIE = 'gabru_session';
const SESSION_MAX_AGE = 14 * 24 * 60 * 60 * 1000;
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

/* ------------------------------------------------------------- passwords */
/* scrypt from node:crypto — no third-party hashing dependency. */

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;

  const expected = Buffer.from(hash, 'hex');
  const candidate = crypto.scryptSync(String(password), salt, 64);
  return expected.length === candidate.length && crypto.timingSafeEqual(expected, candidate);
}

/* -------------------------------------------------------------- sessions */
/* Opaque random tokens; only a hash of the token is written to disk. */

function digest(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function readSessions() {
  try {
    const list = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    return Array.isArray(list) ? list : [];
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`[auth] could not read sessions.json: ${error.message}`);
    }
    return [];
  }
}

function writeSessions(list) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${SESSIONS_FILE}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(list, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, SESSIONS_FILE);
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const live = readSessions().filter((session) => session.expiresAt > Date.now());
  live.push({ tokenHash: digest(token), userId, expiresAt: Date.now() + SESSION_MAX_AGE });
  writeSessions(live);
  return token;
}

function destroySession(token) {
  if (!token) return;
  const tokenHash = digest(token);
  writeSessions(readSessions().filter((session) => session.tokenHash !== tokenHash));
}

function userForToken(token) {
  if (!token) return null;
  const tokenHash = digest(token);
  const session = readSessions().find((item) => item.tokenHash === tokenHash && item.expiresAt > Date.now());
  if (!session) return null;

  const user = users.findById(session.userId);
  return user && user.active !== false ? user : null;
}

/* --------------------------------------------------------------- cookies */

function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;

  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim());
  }
  return null;
}

function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE
  });
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}

/* ------------------------------------------------------------ middleware */

/** Puts the signed-in user (or null) on every request. */
function attachUser(req, res, next) {
  req.user = userForToken(readCookie(req, SESSION_COOKIE));
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return next(httpError(401, 'Please sign in to continue.'));
  return next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(httpError(401, 'Please sign in to continue.'));
    if (req.user.role !== role) return next(httpError(403, 'You do not have permission to do that.'));
    return next();
  };
}

module.exports = {
  SESSION_COOKIE,
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  readCookie,
  setSessionCookie,
  clearSessionCookie,
  attachUser,
  requireAuth,
  requireRole
};
