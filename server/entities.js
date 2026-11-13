import express from 'express';

import { applyQuery, matches, parseJson } from './query.js';
import { entityConfig, withDefaults } from './schema.js';
import { collection, newId, nowIso, replaceCollection, save } from './store.js';

const router = express.Router();

function fail(res, status, message) {
  return res.status(status).json({ error: { message } });
}

function rowsFor(name) {
  return collection(name);
}

// Returns a filter applied to every listing, or { status } when the caller may
// not read the entity at all.
function readScope(name, user) {
  const config = entityConfig(name);
  if (!config) return { status: 404, message: `Unknown entity '${name}'` };
  if (config.read === 'public') return { scope: null };
  if (!user) return { status: 401, message: 'Unauthorized' };
  if (user.role === 'admin' || config.read === 'auth') return { scope: null };
  if (config.read === 'own') return { scope: (row) => row[config.owner] === user.id };
  return { status: 403, message: 'Forbidden' };
}

function canTouch(config, user, row, mode) {
  const rule = mode === 'create' ? config.write : config.updateWrite || config.write;
  if (rule === 'admin') return user?.role === 'admin';
  if (rule === 'public') return true;
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (rule === 'auth') return true;
  if (rule === 'own') return row ? row[config.owner] === user.id : true;
  return false;
}

function guard(res, user, config, row, mode) {
  if (!canTouch(config, user, row, mode)) {
    fail(res, user ? 403 : 401, user ? 'Forbidden' : 'Unauthorized');
    return false;
  }
  return true;
}

function prepareCreate(name, config, user, input) {
  const record = withDefaults(name, input);
  delete record.id;
  delete record.created_date;
  delete record.updated_date;
  delete record.created_by_id;
  if (config.owner && user) record[config.owner] = user.id;
  return {
    ...record,
    id: newId(),
    created_date: nowIso(),
    updated_date: nowIso(),
    created_by_id: user?.id || null,
  };
}

router.get('/entities/:name/count', (req, res) => {
  const { name } = req.params;
  const config = entityConfig(name);
  const access = readScope(name, req.user);
  if (!config) return fail(res, access.status || 404, access.message);
  if (access.status) return fail(res, access.status, access.message);
  const query = parseJson(req.query.q, {});
  const rows = rowsFor(name).filter((row) => (!access.scope || access.scope(row)) && matches(row, query));
  res.json({ count: rows.length });
});

router.get('/entities/:name/aggregate', (req, res) => {
  const { name } = req.params;
  const config = entityConfig(name);
  const access = readScope(name, req.user);
  if (!config) return fail(res, access.status || 404, access.message);
  if (access.status) return fail(res, access.status, access.message);

  const query = parseJson(req.query.q, {});
  const groupBy = String(req.query.group_by || '').trim();
  const sums = String(req.query.sum || '')
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);
  const rows = rowsFor(name).filter((row) => (!access.scope || access.scope(row)) && matches(row, query));

  const groups = new Map();
  for (const row of rows) {
    const key = groupBy ? row[groupBy] ?? null : '__all__';
    const bucket = groups.get(key) || { [groupBy || 'group']: key, count: 0 };
    bucket.count += 1;
    for (const field of sums) bucket[field] = (bucket[field] || 0) + (Number(row[field]) || 0);
    groups.set(key, bucket);
  }
  res.json({ rows: [...groups.values()], total: rows.length });
});

router.get('/entities/:name', (req, res) => {
  const { name } = req.params;
  const access = readScope(name, req.user);
  if (access.status) return fail(res, access.status, access.message);

  const query = parseJson(req.query.q, {});
  const visible = rowsFor(name).filter((row) => !access.scope || access.scope(row));
  const { items, total } = applyQuery(visible, query, req.query.sort_by || req.query.sort, req.query.limit, req.query.skip);
  res.json({ items, total, skip: Number(req.query.skip) || 0, limit: Number(req.query.limit) || total });
});

router.post('/entities/:name/bulk', (req, res) => {
  const { name } = req.params;
  const config = entityConfig(name);
  if (!config) return fail(res, 404, `Unknown entity '${name}'`);
  if (!guard(res, req.user, config, null, 'create')) return;
  const input = Array.isArray(req.body) ? req.body : [];
  const created = input.map((item) => prepareCreate(name, config, req.user, item));
  rowsFor(name).push(...created);
  save();
  res.json(created);
});

router.post('/entities/:name', (req, res) => {
  const { name } = req.params;
  const config = entityConfig(name);
  if (!config) return fail(res, 404, `Unknown entity '${name}'`);
  if (!guard(res, req.user, config, null, 'create')) return;
  const record = prepareCreate(name, config, req.user, req.body || {});
  rowsFor(name).push(record);
  save();
  res.json(record);
});

router.delete('/entities/:name', (req, res) => {
  const { name } = req.params;
  const config = entityConfig(name);
  if (!config) return fail(res, 404, `Unknown entity '${name}'`);
  if (!guard(res, req.user, config, null, 'delete')) return;
  const query = parseJson(req.query.q, {});
  const rows = rowsFor(name);
  const removed = rows.filter((row) => matches(row, query));
  const kept = rows.filter((row) => !matches(row, query));
  replaceCollection(name, kept);
  save();
  res.json({ deleted: removed.length });
});

router.patch('/entities/:name/update-many', (req, res) => {
  const { name } = req.params;
  const config = entityConfig(name);
  if (!config) return fail(res, 404, `Unknown entity '${name}'`);
  if (!guard(res, req.user, config, null, 'update')) return;

  const query = req.body?.query || {};
  const data = req.body?.data || {};
  const patch = data.$set || data;
  const rows = rowsFor(name).filter((row) => matches(row, query));
  for (const row of rows) Object.assign(row, patch, { updated_date: nowIso() });
  save();
  res.json({ updated: rows.length });
});

router.get('/entities/:name/:id', (req, res) => {
  const { name, id } = req.params;
  const access = readScope(name, req.user);
  if (access.status) return fail(res, access.status, access.message);
  const row = rowsFor(name).find((candidate) => candidate.id === id);
  if (!row) return fail(res, 404, 'Record not found');
  if (access.scope && !access.scope(row)) return fail(res, 404, 'Record not found');
  res.json(row);
});

router.put('/entities/:name/:id', (req, res) => {
  const { name, id } = req.params;
  const config = entityConfig(name);
  if (!config) return fail(res, 404, `Unknown entity '${name}'`);
  const row = rowsFor(name).find((candidate) => candidate.id === id);
  if (!row) return fail(res, 404, 'Record not found');
  if (!guard(res, req.user, config, row, 'update')) return;

  const patch = { ...(req.body || {}) };
  delete patch.id;
  delete patch.created_date;
  delete patch.created_by_id;
  Object.assign(row, patch, { updated_date: nowIso() });
  save();
  res.json(row);
});

router.patch('/entities/:name/:id', (req, res) => {
  const { name, id } = req.params;
  const config = entityConfig(name);
  if (!config) return fail(res, 404, `Unknown entity '${name}'`);
  const row = rowsFor(name).find((candidate) => candidate.id === id);
  if (!row) return fail(res, 404, 'Record not found');
  if (!guard(res, req.user, config, row, 'update')) return;

  const patch = { ...(req.body || {}) };
  delete patch.id;
  delete patch.created_date;
  delete patch.created_by_id;
  Object.assign(row, patch, { updated_date: nowIso() });
  save();
  res.json(row);
});

router.delete('/entities/:name/:id', (req, res) => {
  const { name, id } = req.params;
  const config = entityConfig(name);
  if (!config) return fail(res, 404, `Unknown entity '${name}'`);
  const rows = rowsFor(name);
  const row = rows.find((candidate) => candidate.id === id);
  if (!row) return fail(res, 404, 'Record not found');
  if (!guard(res, req.user, config, row, 'delete')) return;
  replaceCollection(name, rows.filter((candidate) => candidate.id !== id));
  save();
  res.json({ id });
});

export default router;
