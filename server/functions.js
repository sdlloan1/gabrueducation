import express from 'express';

import { matches } from './query.js';
import { collection, newId, nowIso, save } from './store.js';

const router = express.Router();

// Service-role data helpers: backend functions run with full access, exactly
// like the deployed Base44 functions that used `db.asServiceRole`.
function rows(name) {
  return collection(name);
}

function find(name, query) {
  return rows(name).filter((row) => matches(row, query));
}

function getRow(name, id) {
  return rows(name).find((row) => row.id === id) || null;
}

function createRow(name, data) {
  const record = { ...data, id: newId(), created_date: nowIso(), updated_date: nowIso() };
  rows(name).push(record);
  save();
  return record;
}

function updateRow(name, id, patch) {
  const row = getRow(name, id);
  if (!row) return null;
  Object.assign(row, patch, { updated_date: nowIso() });
  save();
  return row;
}

function baseUrl(req) {
  const appUrl = req.get('x-base44-app-url');
  if (appUrl) return appUrl.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

function signedUrl(req, uri) {
  if (!uri) return null;
  if (/^https?:\/\//i.test(uri)) return uri;
  return `${baseUrl(req)}${uri}`;
}

function json(res, body, status = 200) {
  return res.status(status).json(body);
}

function logEmail(kind, to, subject) {
  console.log(`[email] ${kind} -> ${to || '(no address)'} :: ${subject}`);
}

// POST /api/functions/productContent
async function productContent(req, res) {
  const user = req.user;
  if (!user) return json(res, { error: 'Unauthorized' }, 401);
  if (!user.is_verified) return json(res, { error: 'Verify your email first' }, 403);

  const productId = String(req.body?.product_id || '').trim();
  if (!productId) return json(res, { error: 'product_id is required' }, 400);

  const product = getRow('Product', productId);
  if (!product) return json(res, { error: 'Product not found' }, 404);

  const owned = find('Purchase', { user_id: user.id, product_id: productId }).map((purchase) => purchase.option || 'full');
  const entitled = user.role === 'admin' || owned.length > 0;

  if (!entitled) {
    return json(res, {
      entitled: false,
      prompt_preview: product.prompt_preview || '',
      prompt_char_count: Number(product.prompt_char_count) || 0,
    });
  }

  const canFiles = user.role === 'admin' || owned.some((option) => ['code', 'developer', 'app_dev', 'full'].includes(option));
  const secret = find('ProductSecret', { product_id: productId })[0] || null;

  const fileUrl = canFiles && secret?.delivery_file_uri ? signedUrl(req, secret.delivery_file_uri) : null;
  const promptFileUrl = secret?.prompt_file_uri ? signedUrl(req, secret.prompt_file_uri) : null;
  const extras = canFiles && Array.isArray(secret?.extra_files) ? secret.extra_files.slice(0, 5) : [];

  return json(res, {
    entitled: true,
    options: owned,
    can_files: canFiles,
    prompt_text: secret?.full_prompt_text || '',
    prompt_char_count: Number(product.prompt_char_count) || 0,
    prompt_file_url: promptFileUrl,
    prompt_file_name: secret?.prompt_file_name || '',
    file_url: fileUrl,
    file_name: secret?.delivery_file_name || '',
    extra_files: extras
      .filter((extra) => extra?.file_uri)
      .map((extra) => ({ name: extra.name || 'File', url: signedUrl(req, extra.file_uri) })),
  });
}

// POST /api/functions/recalcRating
async function recalcRating(req, res) {
  if (!req.user) return json(res, { error: 'Unauthorized' }, 401);
  const productId = String(req.body?.product_id || '').trim();
  if (!productId) return json(res, { error: 'product_id is required' }, 400);
  if (!getRow('Product', productId)) return json(res, { error: 'Product not found' }, 404);

  const visible = find('Review', { product_id: productId }).filter((review) => !review.is_hidden);
  const ratingCount = visible.length;
  const total = visible.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
  const ratingAvg = ratingCount ? Number((total / ratingCount).toFixed(2)) : 0;

  updateRow('Product', productId, { rating_avg: ratingAvg, rating_count: ratingCount });
  return json(res, { rating_avg: ratingAvg, rating_count: ratingCount });
}

// POST /api/functions/confirmOrder — admin approves a UPI payment.
async function confirmOrder(req, res) {
  const user = req.user;
  if (!user) return json(res, { error: 'Unauthorized' }, 401);
  if (user.role !== 'admin') return json(res, { error: 'Forbidden' }, 403);

  const orderId = String(req.body?.order_id || '').trim();
  if (!orderId) return json(res, { error: 'order_id is required' }, 400);

  const order = getRow('Order', orderId);
  if (!order) return json(res, { error: 'Order not found' }, 404);
  if (order.status === 'confirmed') return json(res, { ok: true, already: true });

  const items = Array.isArray(order.items) ? order.items.filter((item) => item?.product_id) : [];
  const existing = find('Purchase', { order_id: order.id });
  const owned = new Set(existing.map((purchase) => purchase.product_id));

  const toCreate = items
    .filter((item) => !owned.has(item.product_id))
    .map((item) => ({
      user_id: order.user_id,
      user_email: order.email || '',
      product_id: item.product_id,
      product_title: item.title || '',
      product_slug: item.slug || '',
      order_id: order.id,
      option: item.option || 'full',
      option_label: item.option_label || '',
      price_paid: Number(item.price) || 0,
      access: 'lifetime',
    }));

  for (const purchase of toCreate) createRow('Purchase', purchase);

  updateRow('Order', order.id, {
    status: 'confirmed',
    confirmed_at: nowIso(),
    rejection_reason: '',
  });

  createRow('Notification', {
    user_id: order.user_id,
    title: 'Payment approved 🎉',
    body: `Order ${order.order_number || ''} is confirmed. Your downloads are unlocked in My Library for life.`,
    type: 'approved',
    link: '/library',
    is_read: false,
  });

  if (order.email) {
    logEmail('payment confirmed', order.email, `Payment confirmed — ${order.order_number || 'Gabru Education order'}`);
  }

  for (const item of items) {
    const product = getRow('Product', item.product_id);
    if (product) {
      updateRow('Product', product.id, { sales_count: (Number(product.sales_count) || 0) + 1 });
    }
  }

  return json(res, { ok: true, granted: toCreate.length });
}

// POST /api/functions/rejectOrder — admin rejects a UPI payment with a reason.
async function rejectOrder(req, res) {
  const user = req.user;
  if (!user) return json(res, { error: 'Unauthorized' }, 401);
  if (user.role !== 'admin') return json(res, { error: 'Forbidden' }, 403);

  const orderId = String(req.body?.order_id || '').trim();
  const reason = String(req.body?.reason || '').trim();
  if (!orderId) return json(res, { error: 'order_id is required' }, 400);
  if (!reason) return json(res, { error: 'A rejection reason is required' }, 400);

  const order = getRow('Order', orderId);
  if (!order) return json(res, { error: 'Order not found' }, 404);

  updateRow('Order', order.id, { status: 'rejected', rejection_reason: reason });

  createRow('Notification', {
    user_id: order.user_id,
    title: 'Payment could not be verified',
    body: `Order ${order.order_number || ''} was rejected. Reason: ${reason}`,
    type: 'rejected',
    link: `/order/${order.id}`,
    is_read: false,
  });

  if (order.email) {
    logEmail('payment rejected', order.email, `Payment not verified — ${order.order_number || 'Gabru Education order'}`);
  }

  return json(res, { ok: true });
}

const HANDLERS = { productContent, recalcRating, confirmOrder, rejectOrder };

router.post('/functions/:name', async (req, res) => {
  const handler = HANDLERS[req.params.name];
  if (!handler) return json(res, { error: `Unknown function '${req.params.name}'` }, 404);
  try {
    return await handler(req, res);
  } catch (error) {
    console.error(`[functions] ${req.params.name} failed:`, error);
    return json(res, { error: error.message }, 500);
  }
});

export default router;
