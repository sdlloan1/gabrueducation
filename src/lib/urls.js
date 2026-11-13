// Deployment-aware URLs.
//
// Locally and in a Base44 environment the storefront is served from the site
// root and proxies `/api`, so every path stays relative. When the frontend is
// hosted on its own static host (GitHub Pages serves a project site from
// `/<repo>/`) the app needs:
//   - VITE_BASE_PATH   the sub-path the site is served from
//   - VITE_API_BASE_URL the absolute origin (or origin + /api) of the API
// Both are build-time values; leaving them unset keeps the single-origin setup.

const rawBase = import.meta.env.BASE_URL || '/';
export const basePath = rawBase === '/' ? '' : rawBase.replace(/\/+$/, '');

const configuredApiOrigin = (import.meta.env.VITE_API_BASE_URL || '')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

export const API_ORIGIN = configuredApiOrigin;
export const API_BASE = configuredApiOrigin ? `${configuredApiOrigin}/api` : '/api';

// A path for `window.location` / `<a href>` in this deployment.
export function appPath(path = '/') {
  if (!basePath) return path;
  if (path === basePath || path.startsWith(`${basePath}/`)) return path;
  return path === '/' ? `${basePath}/` : `${basePath}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Strip the deployment sub-path so the result can be handed to the router.
export function stripBasePath(pathname = '/') {
  if (!basePath) return pathname;
  if (pathname === basePath) return '/';
  return pathname.startsWith(`${basePath}/`) ? pathname.slice(basePath.length) : pathname;
}

// Assets the API serves (placeholders, uploaded files) live on the API origin.
export function apiUrl(url) {
  if (!configuredApiOrigin || typeof url !== 'string') return url;
  return url.startsWith('/api/') ? `${configuredApiOrigin}${url}` : url;
}
