const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Returns the locked prompt/file content only to buyers, admins, or via the free preview.
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

    const purchases = await db.entities.Purchase.filter({
      user_id: user.id,
      product_id: productId,
    });
    const rows = Array.isArray(purchases) ? purchases : [];
    const entitled = user.role === 'admin' || rows.length > 0;

    if (!entitled) {
      return Response.json({
        entitled: false,
        prompt_preview: product.prompt_preview || '',
        prompt_char_count: Number(product.prompt_char_count) || 0,
      });
    }

    // Every option includes the prompt; only code and developer buyers get the files.
    const owned = rows.map((p) => p.option || 'full');
    const canFiles = user.role === 'admin'
      || owned.some((o) => o === 'code' || o === 'developer' || o === 'app_dev' || o === 'full');

    const secrets = await db.asServiceRole.entities.ProductSecret.filter({ product_id: productId });
    const secret = Array.isArray(secrets) ? secrets[0] : null;

    let file_url = null;
    if (canFiles && secret?.delivery_file_uri) {
      const signed = await db.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: secret.delivery_file_uri,
        expires_in: 3600,
      });
      file_url = signed?.signed_url || null;
    }

    // The prompt file belongs to every buyer, whatever option they picked.
    let prompt_file_url = null;
    if (secret?.prompt_file_uri) {
      const signed = await db.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: secret.prompt_file_uri,
        expires_in: 3600,
      });
      prompt_file_url = signed?.signed_url || null;
    }

    const extras = canFiles && Array.isArray(secret?.extra_files) ? secret.extra_files.slice(0, 5) : [];
    const extra_files = [];
    for (const extra of extras) {
      if (!extra?.file_uri) continue;
      const signed = await db.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: extra.file_uri,
        expires_in: 3600,
      });
      if (signed?.signed_url) extra_files.push({ name: extra.name || 'File', url: signed.signed_url });
    }

    return Response.json({
      entitled: true,
      options: owned,
      can_files: canFiles,
      prompt_text: secret?.full_prompt_text || '',
      prompt_char_count: Number(product.prompt_char_count) || 0,
      prompt_file_url,
      prompt_file_name: secret?.prompt_file_name || '',
      file_url,
      file_name: secret?.delivery_file_name || '',
      extra_files,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}