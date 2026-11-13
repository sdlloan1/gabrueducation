// Runtime data client for the app.
//
// The app is written against the Base44 SDK surface (`db.entities.*`,
// `db.auth.*`, `db.functions.invoke`, `db.integrations.Core.*`,
// `db.app.getPublicSettings`). This module provides that surface on top of the
// local API in `server/` and is installed on `globalThis.__B44_DB__` before any
// app module runs (see index.html).
import { API_BASE, apiUrl, appPath } from '@/lib/urls';

const TOKEN_KEY = 'base44_access_token';

function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function setToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = 'GET', body, formData, auth = true } = {}) {
  const headers = {};
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (window.location?.origin) headers['X-Base44-App-Url'] = window.location.origin;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: formData ?? (body === undefined ? undefined : JSON.stringify(body)),
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const message = payload?.error?.message || payload?.detail || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }
  return payload;
}

function encodeQuery(query) {
  return encodeURIComponent(JSON.stringify(query || {}));
}

// `filter` resolves to the array of records, with `items`/`total` exposed as
// non-enumerable properties so callers written for either shape keep working.
function decorate(items, page) {
  Object.defineProperties(items, {
    items: { value: items, enumerable: false },
    total: { value: page?.total ?? items.length, enumerable: false },
    skip: { value: page?.skip ?? 0, enumerable: false },
    limit: { value: page?.limit ?? items.length, enumerable: false },
  });
  return items;
}

function entityClient(name) {
  const encodeId = (id) => encodeURIComponent(id);

  const list = async (sortOrOptions, maybeLimit) => {
    const options = typeof sortOrOptions === 'object' && sortOrOptions !== null && !Array.isArray(sortOrOptions)
      ? sortOrOptions
      : { sort: sortOrOptions, limit: maybeLimit };
    const params = new URLSearchParams();
    params.set('q', JSON.stringify({}));
    if (options?.sort) params.set('sort_by', options.sort);
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.skip) params.set('skip', String(options.skip));
    const page = await request(`/entities/${name}?${params.toString()}`);
    return decorate(page?.items || [], page);
  };

  const filter = async (query, sortOrOptions, maybeLimit) => {
    const options = typeof sortOrOptions === 'object' && sortOrOptions !== null && !Array.isArray(sortOrOptions)
      ? sortOrOptions
      : { sort: sortOrOptions, limit: maybeLimit };
    const params = new URLSearchParams();
    params.set('q', JSON.stringify(query || {}));
    if (options?.sort) params.set('sort_by', options.sort);
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.skip) params.set('skip', String(options.skip));
    const page = await request(`/entities/${name}?${params.toString()}`);
    return decorate(page?.items || [], page);
  };

  return {
    filter,
    list,
    get: (id) => request(`/entities/${name}/${encodeId(id)}`),
    create: (data) => request(`/entities/${name}`, { method: 'POST', body: data || {} }),
    update: (id, data) => request(`/entities/${name}/${encodeId(id)}`, { method: 'PUT', body: data || {} }),
    delete: (id) => request(`/entities/${name}/${encodeId(id)}`, { method: 'DELETE' }),
    bulkCreate: (items) => request(`/entities/${name}/bulk`, { method: 'POST', body: items || [] }),
    updateMany: (query, data) => request(`/entities/${name}/update-many`, { method: 'PATCH', body: { query, data } }),
    count: async (query) => {
      const result = await request(`/entities/${name}/count?q=${encodeQuery(query)}`);
      return Number(result?.count) || 0;
    },
    aggregate: async ({ query = {}, groupBy, sum = [] } = {}) => {
      const params = new URLSearchParams();
      params.set('q', JSON.stringify(query));
      if (groupBy) params.set('group_by', groupBy);
      if (sum.length) params.set('sum', sum.join(','));
      return request(`/entities/${name}/aggregate?${params.toString()}`);
    },
  };
}

const entities = new Proxy(
  {},
  {
    get: (_target, name) => {
      if (typeof name !== 'string') return undefined;
      entityClient.__cache ||= new Map();
      if (!entityClient.__cache.has(name)) entityClient.__cache.set(name, entityClient(name));
      return entityClient.__cache.get(name);
    },
  }
);

const auth = {
  setToken,
  getToken,
  async me() {
    return request('/auth/me');
  },
  async isAuthenticated() {
    if (!getToken()) return false;
    try {
      await request('/auth/me');
      return true;
    } catch {
      return false;
    }
  },
  async register({ email, password }) {
    return request('/auth/register', { method: 'POST', body: { email, password } });
  },
  async verifyOtp({ email, otpCode }) {
    return request('/auth/verify-otp', { method: 'POST', body: { email, otp_code: otpCode } });
  },
  async resendOtp(email) {
    return request('/auth/resend-otp', { method: 'POST', body: { email } });
  },
  async resetPasswordRequest(email) {
    return request('/auth/reset-password-request', { method: 'POST', body: { email } });
  },
  async resetPassword({ resetToken, newPassword }) {
    return request('/auth/reset-password', { method: 'POST', body: { reset_token: resetToken, new_password: newPassword } });
  },
  logout(redirectUrl) {
    setToken('');
    request('/auth/logout', { method: 'POST', auth: false }).catch(() => {});
    if (redirectUrl) window.location.href = appPath('/login');
  },
  redirectToLogin() {
    if (window.location.pathname !== appPath('/login')) window.location.href = appPath('/login');
  },
  async loginWithProvider() {
    throw new Error('Google sign-in is not configured for this local environment. Use email and password.');
  },
};

const functions = {
  invoke: (name, payload) => request(`/functions/${name}`, { method: 'POST', body: payload || {} }),
};

async function upload(file, visibility) {
  const formData = new FormData();
  formData.append('file', file);
  const result = await request(`/integrations/core/upload/${visibility}`, { method: 'POST', formData });
  // The API answers with its own file path; resolve it against the API origin
  // so the stored URL also works when the frontend is hosted elsewhere.
  return { ...result, file_url: apiUrl(result?.file_uri || result?.file_url) };
}

const integrations = {
  Core: {
    UploadPrivateFile: ({ file }) => upload(file, 'private'),
    UploadPublicFile: ({ file }) => upload(file, 'public'),
    CreateFileSignedUrl: ({ file_uri }) =>
      request(`/files/sign?uri=${encodeURIComponent(file_uri)}`, { method: 'GET', auth: false }),
    SendEmail: (payload) => request('/integrations/core/send-email', { method: 'POST', body: payload }),
  },
};

const app = {
  getPublicSettings: () => request('/app/public-settings', { auth: false }),
};

const db = { auth, entities, functions, integrations, app };

globalThis.__B44_DB__ = db;

export default db;
