const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Keeps a product's stored rating in sync with its visible reviews, so cards on
// the home page, search and category pages show the real stars.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const productId = String(body.product_id || '').trim();
    if (!productId) return Response.json({ error: 'product_id is required' }, { status: 400 });

    const product = await db.asServiceRole.entities.Product
      .get(productId)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });

    const reviews = await db.asServiceRole.entities.Review.filter({ product_id: productId });
    const visible = (Array.isArray(reviews) ? reviews : []).filter((review) => !review.is_hidden);
    const ratingCount = visible.length;
    const total = visible.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
    const ratingAvg = ratingCount ? Number((total / ratingCount).toFixed(2)) : 0;

    await db.asServiceRole.entities.Product.update(productId, {
      rating_avg: ratingAvg,
      rating_count: ratingCount,
    });

    return Response.json({ rating_avg: ratingAvg, rating_count: ratingCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}