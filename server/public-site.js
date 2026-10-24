'use strict';

const fs = require('fs');
const path = require('path');

const content = require('../lib/content');
const pages = require('../lib/pages');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2'
};

/* --------------------------------------------------------------- helpers */

function sendHtml(res, html, status = 200) {
  const buffer = Buffer.from(html, 'utf8');
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': buffer.length,
    'Cache-Control': 'no-store'
  });
  res.end(buffer);
}

function sendJson(res, data, status = 200) {
  const buffer = Buffer.from(JSON.stringify(data), 'utf8');
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': buffer.length,
    'Cache-Control': 'no-store'
  });
  res.end(buffer);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, { ok: false, error: 'Not found' }, 404);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': data.length,
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=60'
    });
    res.end(data);
  });
}

/** Resolves a url path inside a directory, refusing anything that escapes it. */
function safeJoin(baseDir, urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const target = path.resolve(baseDir, `.${path.posix.normalize(decoded)}`);
  const root = path.resolve(baseDir);
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}

function notFound(res, urlPath) {
  sendHtml(res, pages.notFound(content.getSite(), urlPath), 404);
}

/* ----------------------------------------------------------------- routes */

/**
 * The server-rendered public website: home, courses, about, blog, contact, the
 * published post files and the static assets. Mounted last, so the staff console
 * and the JSON API get first refusal on every request.
 */
function handleSite(req, res, next) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const { pathname } = url;

  if (pathname === '/healthz') {
    sendJson(res, { ok: true, status: 'healthy' });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, { ok: false, error: 'Method not allowed' }, 405);
    return;
  }

  const site = content.getSite();

  if (pathname === '/' || pathname === '/index.html') {
    sendHtml(res, pages.home(site, content.getCourses(), content.getPosts()));
    return;
  }
  if (pathname === '/about') {
    sendHtml(res, pages.about(site));
    return;
  }
  if (pathname === '/courses') {
    sendHtml(res, pages.coursesPage(site, content.getCourses()));
    return;
  }
  if (pathname === '/blog') {
    sendHtml(res, pages.blogPage(site, content.getPosts()));
    return;
  }
  if (pathname === '/contact') {
    sendHtml(res, pages.contact(site, content.getCourses()));
    return;
  }

  const postMatch = /^\/blog\/([^/]+)\/?$/.exec(pathname);
  if (postMatch) {
    const slug = decodeURIComponent(postMatch[1]);
    const post = content.getPost(slug);
    const file = content.postFilePath(slug);
    if (post && fs.existsSync(file)) {
      sendFile(res, file);
      return;
    }
    notFound(res, pathname);
    return;
  }

  /* --- static assets --- */
  if (pathname.startsWith('/posts/')) {
    const target = safeJoin(content.POSTS_DIR, pathname.slice('/posts'.length));
    if (target && fs.existsSync(target) && fs.statSync(target).isFile()) {
      sendFile(res, target);
      return;
    }
    notFound(res, pathname);
    return;
  }

  if (pathname.startsWith('/css/') || pathname.startsWith('/js/') || pathname.startsWith('/img/')) {
    const target = safeJoin(PUBLIC_DIR, pathname);
    if (target && fs.existsSync(target) && fs.statSync(target).isFile()) {
      sendFile(res, target);
      return;
    }
  }

  notFound(res, pathname);
}

module.exports = { handleSite, notFound };
