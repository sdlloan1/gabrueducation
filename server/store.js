import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

const EMPTY = {
  collections: {},
  users: [],
  users_meta: { otp: {}, reset: {} },
  sessions: [],
};

let state = structuredClone(EMPTY);

export function initStore() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    try {
      state = { ...structuredClone(EMPTY), ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) };
    } catch (error) {
      console.error('Could not read data file, starting empty:', error.message);
    }
  }
  state.collections ||= {};
  state.users ||= [];
  state.users_meta ||= { otp: {}, reset: {} };
  state.users_meta.otp ||= {};
  state.users_meta.reset ||= {};
  save();
}

export function getState() {
  return state;
}

export function save() {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state));
  fs.renameSync(tmp, DB_FILE);
}

export function collection(name) {
  state.collections[name] ||= [];
  return state.collections[name];
}

export function replaceCollection(name, rows) {
  state.collections[name] = rows;
}

export function newId() {
  return crypto.randomBytes(12).toString('hex');
}

export function nowIso() {
  return new Date().toISOString();
}
