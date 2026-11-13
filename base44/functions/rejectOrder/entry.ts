const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Admin rejects a UPI payment with a reason the customer can read.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const orderId = String(body.order_id || '').trim();
    const reason = String(body.reason || '').trim();
    if (!orderId) return Response.json({ error: 'order_id is required' }, { status: 400 });
    if (!reason) return Response.json({ error: 'A rejection reason is required' }, { status: 400 });

    const order = await db.asServiceRole.entities.Order
      .get(orderId)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

    await db.asServiceRole.entities.Order.update(order.id, {
      status: 'rejected',
      rejection_reason: reason,
    });

    await db.asServiceRole.entities.Notification.create({
      user_id: order.user_id,
      title: 'Payment could not be verified',
      body: `Order ${order.order_number || ''} was rejected. Reason: ${reason}`,
      type: 'rejected',
      link: `/order/${order.id}`,
      is_read: false,
    });

    if (order.email) {
      try {
        await db.asServiceRole.integrations.Core.SendEmail({
          to: order.email,
          subject: `Payment not verified — ${order.order_number || 'Gabru Education order'}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
            <h2 style="color:#dc2626">Payment could not be verified</h2>
            <p>Hi ${order.customer_name || 'there'}, we could not verify the payment for order <b>${order.order_number || ''}</b>.</p>
            <p style="background:#fef2f2;border:1px solid #fecaca;padding:12px;border-radius:10px"><b>Reason:</b> ${reason}</p>
            <p>If you believe this is a mistake, reply to this email or message us on WhatsApp and we will check again.</p>
          </div>`,
        });
      } catch (mailError) {
        // Email is best-effort — the rejection record and notification already exist.
        console.log('Rejection email failed:', mailError?.message);
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}