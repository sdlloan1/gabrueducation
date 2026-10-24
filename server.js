'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const content = require('./lib/content');
const pages = require('./lib/pages');
const { createPost, deletePost, ValidationError } = require('./lib/blog');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

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

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 2 * 1024 * 1024) {
        reject(new ValidationError('That post is too large to publish (2 MB limit).'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readJsonBody(req) {
  const raw = await readBody(req);
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new ValidationError('Could not read that request.');
  }
}

function notFound(res, urlPath) {
  sendHtml(res, pages.notFound(content.getSite(), urlPath), 404);
}

/* ----------------------------------------------------------------- routes */

async function handle(req, res, url) {
  const { pathname } = url;
  const method = req.method || 'GET';

  if (pathname === '/healthz') {
    sendJson(res, { ok: true, status: 'healthy' });
    return;
  }

  /* --- API --- */
  if (pathname === '/api/posts' && method === 'POST') {
    const payload = await readJsonBody(req);
    const post = createPost(payload);
    console.log(`[blog] published ${post.slug} -> ${post.file}`);
    sendJson(res, { ok: true, post }, 201);
    return;
  }

  const deleteMatch = /^\/api\/posts\/([^/]+)$/.exec(pathname);
  if (deleteMatch && method === 'DELETE') {
    const slug = decodeURIComponent(deleteMatch[1]);
    const removed = deletePost(slug);
    if (!removed) {
      sendJson(res, { ok: false, error: 'Post not found' }, 404);
      return;
    }
    console.log(`[blog] deleted ${slug}`);
    sendJson(res, { ok: true });
    return;
  }

  if (pathname === '/api/contact' && method === 'POST') {
    const payload = await readJsonBody(req);
    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim();
    const message = String(payload.message || '').trim();

    if (name.length < 2) throw new ValidationError('Please tell us your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new ValidationError('Please enter a valid email address.');
    if (message.length < 10) throw new ValidationError('Please add a short message.');

    content.addMessage({
      name,
      email,
      phone: String(payload.phone || '').trim(),
      interest: String(payload.interest || '').trim(),
      message,
      receivedAt: new Date().toISOString()
    });
    console.log(`[contact] enquiry from ${email}`);
    sendJson(res, { ok: true }, 201);
    return;
  }

  if (method !== 'GET' && method !== 'HEAD') {
    sendJson(res, { ok: false, error: 'Method not allowed' }, 405);
    return;
  }

  /* --- pages --- */
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
  if (pathname === '/admin') {
    sendHtml(res, pages.admin(site, content.getPosts(), content.getMessages()));
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

/* ------------------------------------------------------------------ start */

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  Promise.resolve()
    .then(() => handle(req, res, url))
    .catch((error) => {
      if (res.headersSent) return;
      if (error instanceof ValidationError || error.statusCode === 400) {
        sendJson(res, { ok: false, error: error.message }, 400);
        return;
      }
      console.error(`[server] ${req.method} ${url.pathname} failed:`, error);
      sendHtml(res, pages.notFound(content.getSite(), url.pathname), 500);
    });
});

server.listen(PORT, HOST, () => {
  console.log(`Gabru Education running at http://${HOST}:${PORT} (preview on port ${PORT})`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
