import crypto from 'node:crypto';
import express from 'express';

import { getState, newId, nowIso, save } from './store.js';

const router = express.Router();
const SECRET = process.env.AUTH_SECRET || 'gabrueducation-local-dev-secret';
const APP_ID = process.env.APP_ID || '6af5debcf61bb528aaf9d2f9';
const ALLOW_FIXED_OTP = process.env.DEV_ALLOW_FIXED_OTP === '1';
const FIXED_OTP = '000000';

function sign(payloadB64) {
  return crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
}

export function issueToken(userId) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + 30 * 24 * 3600 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payloadB64, signature] = token.split('.');
  const expected = sign(payloadB64);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}

function checkPassword(password, user) {
  const { hash } = hashPassword(password, user.password_salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(user.password_hash));
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name || '',
    role: user.role || 'user',
    created_date: user.created_date,
  };
}

export function attachUser(req, _res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = readToken(token);
  if (payload) {
    const user = getState().users.find((candidate) => candidate.id === payload.uid);
    if (user) req.user = user;
  }
  next();
}

function findUser(email) {
  const needle = String(email || '').trim().toLowerCase();
  return getState().users.find((user) => user.email === needle);
}

function otpFor(email) {
  const meta = getState().users_meta.otp;
  const entry = meta[email];
  if (!entry || entry.expires < Date.now()) return null;
  return entry.code;
}

function issueOtp(email) {
  const code = String(crypto.randomInt(100000, 999999));
  getState().users_meta.otp[email] = { code, expires: Date.now() + 15 * 60 * 1000 };
  save();
  console.log(`[auth] verification code for ${email}: ${code}`);
  return code;
}

function fail(res, status, message) {
  return res.status(status).json({ error: { message } });
}

// App public settings, fetched before anything else on boot.
router.get('/app/public-settings', (_req, res) => {
  res.json({
    id: APP_ID,
    public_settings: {
      app_name: 'Gabru Education',
      app_id: APP_ID,
      auth_required: false,
    },
  });
});

router.get('/apps/public/login-info/by-id/:appId', (req, res) => {
  res.json({
    id: req.params.appId,
    name: 'Gabru Education',
    auth_config: { mfa_policy: 'off', providers: [] },
    public_settings: { app_name: 'Gabru Education' },
  });
});

function loginHandler(req, res) {
  const { email, password } = req.body || {};
  const user = findUser(email);
  if (!user || !checkPassword(password || '', user)) return fail(res, 401, 'Invalid email or password');
  if (!user.is_verified) return fail(res, 403, 'Verify your email before signing in');
  const access_token = issueToken(user.id);
  return res.json({ access_token, user: publicUser(user) });
}

router.post('/auth/login', loginHandler);
router.post('/apps/:appId/auth/login', loginHandler);

router.post('/auth/register', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail(res, 400, 'Enter a valid email address');
  if (password.length < 6) return fail(res, 400, 'Password must be at least 6 characters');
  if (findUser(email)) return fail(res, 409, 'An account with this email already exists');

  const { salt, hash } = hashPassword(password);
  const user = {
    id: newId(),
    email,
    full_name: '',
    role: 'user',
    password_salt: salt,
    password_hash: hash,
    is_verified: false,
    created_date: nowIso(),
  };
  getState().users.push(user);
  save();
  const code = issueOtp(email);
  res.json({ ok: true, otp_sent: true, ...(ALLOW_FIXED_OTP ? { dev_otp: code } : {}) });
});

router.post('/auth/resend-otp', (req, res) => {
  const email = String(req.body?.email || req.body?.email_address || '').trim().toLowerCase();
  if (!findUser(email)) return fail(res, 404, 'No account found for this email');
  const code = issueOtp(email);
  res.json({ ok: true, ...(ALLOW_FIXED_OTP ? { dev_otp: code } : {}) });
});

router.post('/auth/verify-otp', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.otp_code || req.body?.otpCode || '').trim();
  const user = findUser(email);
  if (!user) return fail(res, 404, 'No account found for this email');

  const expected = otpFor(email);
  const fixedAllowed = ALLOW_FIXED_OTP && code === FIXED_OTP;
  if (!fixedAllowed && (!expected || expected !== code)) return fail(res, 400, 'That code is not valid. Try again.');

  user.is_verified = true;
  delete getState().users_meta.otp[email];
  save();
  res.json({ access_token: issueToken(user.id), user: publicUser(user) });
});

router.post('/auth/reset-password-request', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const user = findUser(email);
  if (user) {
    const token = crypto.randomBytes(24).toString('hex');
    getState().users_meta.reset[token] = { user_id: user.id, expires: Date.now() + 60 * 60 * 1000 };
    save();
    console.log(`[auth] password reset link for ${email}: /reset-password?token=${token}`);
    return res.json({ ok: true, ...(ALLOW_FIXED_OTP ? { dev_reset_token: token } : {}) });
  }
  res.json({ ok: true });
});

router.post('/auth/reset-password', (req, res) => {
  const token = String(req.body?.reset_token || req.body?.resetToken || '');
  const newPassword = String(req.body?.new_password || req.body?.newPassword || '');
  const entry = getState().users_meta.reset[token];
  if (!entry || entry.expires < Date.now()) return fail(res, 400, 'This reset link has expired');
  if (newPassword.length < 6) return fail(res, 400, 'Password must be at least 6 characters');
  const user = getState().users.find((candidate) => candidate.id === entry.user_id);
  if (!user) return fail(res, 404, 'Account not found');
  const { salt, hash } = hashPassword(newPassword);
  user.password_salt = salt;
  user.password_hash = hash;
  delete getState().users_meta.reset[token];
  save();
  res.json({ ok: true });
});

router.get('/auth/me', (req, res) => {
  if (!req.user) return fail(res, 401, 'Unauthorized');
  res.json(publicUser(req.user));
});

router.post('/auth/logout', (_req, res) => res.json({ ok: true }));

router.patch('/auth/me', (req, res) => {
  if (!req.user) return fail(res, 401, 'Unauthorized');
  if (typeof req.body?.full_name === 'string') req.user.full_name = req.body.full_name;
  save();
  res.json(publicUser(req.user));
});

export default router;
