const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

function money(n) {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(n) || 0);
}

// Admin approves a UPI payment: grants lifetime access, notifies the buyer and emails the files.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const orderId = String(body.order_id || '').trim();
    if (!orderId) return Response.json({ error: 'order_id is required' }, { status: 400 });

    const order = await db.asServiceRole.entities.Order
      .get(orderId)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });
    if (order.status === 'confirmed') return Response.json({ ok: true, already: true });

    const items = Array.isArray(order.items) ? order.items.filter((i) => i?.product_id) : [];
    const existing = await db.asServiceRole.entities.Purchase.filter({ order_id: order.id });
    const owned = new Set((Array.isArray(existing) ? existing : []).map((p) => p.product_id));
    const toCreate = items
      .filter((i) => !owned.has(i.product_id))
      .map((i) => ({
        user_id: order.user_id,
        user_email: order.email || '',
        product_id: i.product_id,
        product_title: i.title || '',
        product_slug: i.slug || '',
        order_id: order.id,
        option: i.option || 'full',
        option_label: i.option_label || '',
        price_paid: Number(i.price) || 0,
        access: 'lifetime',
      }));
    if (toCreate.length) await db.asServiceRole.entities.Purchase.bulkCreate(toCreate);

    await db.asServiceRole.entities.Order.update(order.id, {
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      rejection_reason: '',
    });

    await db.asServiceRole.entities.Notification.create({
      user_id: order.user_id,
      title: 'Payment approved 🎉',
      body: `Order ${order.order_number || ''} is confirmed. Your downloads are unlocked in My Library for life.`,
      type: 'approved',
      link: '/library',
      is_read: false,
    });

    const appUrl = String(req.headers.get('X-Base44-App-Url') || '').replace(/\/$/, '');
    const MAILABLE = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'csv', 'txt', 'md', 'ics', 'xlsx', 'docx'];

    // Sign the file(s) each buyer's option includes, so the email can carry them.
    const filesFor = async (productId, option) => {
      const secrets = await db.asServiceRole.entities.ProductSecret.filter({ product_id: productId });
      const secret = Array.isArray(secrets) ? secrets[0] : null;
      const files = [];
      const add = async (uri, name) => {
        if (!uri) return;
        const signed = await db.asServiceRole.integrations.Core.CreateFileSignedUrl({
          file_uri: uri,
          expires_in: 3600,
        });
        if (signed?.signed_url) files.push({ name: name || 'File', url: signed.signed_url });
      };
      await add(secret?.prompt_file_uri, secret?.prompt_file_name);
      if (String(option || 'full') !== 'prompt') {
        await add(secret?.delivery_file_uri, secret?.delivery_file_name);
        const extras = Array.isArray(secret?.extra_files) ? secret.extra_files.slice(0, 4) : [];
        for (const extra of extras) await add(extra?.file_uri, extra?.name);
      }
      return files;
    };

    const purchases = [];
    for (const item of items) {
      const files = await filesFor(item.product_id, item.option).catch(() => []);
      purchases.push({ title: item.title || 'Your product', files });
    }

    if (order.email) {
      const rows = items
        .map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0">${i.title}</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right">${money(i.price)}</td></tr>`)
        .join('');
      const downloadRows = purchases
        .filter((p) => p.files.length)
        .map((p) => `<p style="margin:10px 0 2px"><b>${p.title}</b></p><ul style="margin:0 0 10px 18px;padding:0">${p.files
          .map((f) => `<li><a href="${f.url}" style="color:#2563EB">${f.name}</a></li>`)
          .join('')}</ul>`)
        .join('');
      const attachments = [];
      for (const p of purchases) {
        for (const f of p.files) {
          if (attachments.length >= 5) break;
          const ext = String(f.name).split('.').pop().toLowerCase();
          if (MAILABLE.includes(ext)) attachments.push({ filename: f.name, file_url: f.url });
        }
      }
      const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
        <h2 style="color:#2563EB">Payment approved</h2>
        <p>Hi ${order.customer_name || 'there'}, your order <b>${order.order_number || ''}</b> is confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}</table>
        <p style="font-size:18px"><b>Total paid: ${money(order.total)}</b></p>
        ${downloadRows ? `<h3 style="color:#0f172a;margin:18px 0 0">Your files</h3>${downloadRows}` : ''}
        <p>These links stay valid for one hour. You can download your files any time from My Library — lifetime access.</p>
        ${appUrl ? `<p><a href="${appUrl}/library" style="background:#2563EB;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none">Open My Library</a></p>` : ''}
        <p style="color:#64748b;font-size:12px">Gabru Education — templates, prompts, courses and tools.</p>
      </div>`;
      const send = (withFiles) =>
        db.asServiceRole.integrations.Core.SendEmail({
          to: order.email,
          subject: `Payment confirmed — ${order.order_number || 'Gabru Education order'}`,
          html,
          category: 'transactional',
          ...(withFiles && attachments.length ? { attachments } : {}),
        });
      try {
        if (attachments.length) {
          try {
            await send(true);
          } catch {
            await send(false);
          }
        } else {
          await send(false);
        }
      } catch (mailError) {
        // Email is best-effort — the approval and the buyer's downloads must still succeed.
        console.log('Confirmation email failed:', mailError?.message);
      }
    }

    for (const item of items) {
      const product = await db.asServiceRole.entities.Product
        .get(item.product_id)
        .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (product) {
        await db.asServiceRole.entities.Product.update(product.id, {
          sales_count: (Number(product.sales_count) || 0) + 1,
        });
      }
    }

    return Response.json({ ok: true, granted: toCreate.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}