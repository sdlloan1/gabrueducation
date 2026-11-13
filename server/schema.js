// Entity definitions mirrored from base44/entities/*.jsonc plus the two
// collections the app uses that the export did not include (SiteSettings,
// ProductSecret). `read` / `write` describe the access rule enforced by the API:
//   read:  'public' | 'auth' | 'own' | 'admin'
//   write: 'public' | 'auth' | 'own' | 'admin'
// 'own' compares `owner` on the record with the signed-in user's id.
export const ENTITIES = {
  Product: {
    read: 'public',
    write: 'admin',
    defaults: { images: [], tags: [], description_images: [], is_active: true, is_featured: false, rating_avg: 0, rating_count: 0, sales_count: 0 },
  },
  ProductSecret: {
    read: 'admin',
    write: 'admin',
    defaults: { extra_files: [] },
  },
  Category: {
    read: 'public',
    write: 'admin',
    defaults: { sort_order: 0, is_active: true },
  },
  Banner: {
    read: 'public',
    write: 'admin',
    defaults: { sort_order: 0, is_active: true },
  },
  Blog: {
    read: 'public',
    write: 'admin',
    defaults: { tags: [], seo_keywords: [], is_published: true, views: 0, read_time: 5 },
  },
  SiteSettings: {
    read: 'public',
    write: 'admin',
    defaults: { refund_enabled: false, refund_days: 0, pending_hours: 24 },
  },
  Review: {
    read: 'public',
    write: 'auth',
    updateWrite: 'admin',
    deleteWrite: 'admin',
    defaults: { is_hidden: false, is_verified: true, images: [] },
  },
  Order: {
    read: 'own',
    write: 'auth',
    updateWrite: 'admin',
    deleteWrite: 'admin',
    owner: 'user_id',
    defaults: { items: [], status: 'pending', total: 0, mrp: 0, payment_method: 'upi' },
  },
  Purchase: {
    read: 'own',
    write: 'admin',
    owner: 'user_id',
    defaults: { access: 'lifetime' },
  },
  SavedItem: {
    read: 'own',
    write: 'own',
    owner: 'user_id',
  },
  Notification: {
    read: 'own',
    write: 'own',
    owner: 'user_id',
    defaults: { is_read: false, type: 'general' },
  },
  ContactMessage: {
    read: 'admin',
    write: 'public',
    defaults: { is_handled: false },
  },
  User: {
    read: 'admin',
    write: 'admin',
  },
};

export function entityConfig(name) {
  return ENTITIES[name] || null;
}

export function withDefaults(name, data) {
  const config = entityConfig(name);
  return { ...(config?.defaults || {}), ...(data || {}) };
}
