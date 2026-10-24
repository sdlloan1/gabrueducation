'use strict';

const { escapeHtml, formatDate } = require('./utils');

const NAV = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/courses', label: 'Courses', key: 'courses' },
  { href: '/about', label: 'About', key: 'about' },
  { href: '/blog', label: 'Blog', key: 'blog' },
  { href: '/contact', label: 'Contact', key: 'contact' }
];

const ICONS = {
  spark: '<path d="M12 2.6 4.8 13.2h5.6L9.6 21.4 19.4 10h-6z"/>',
  board: '<rect x="3.2" y="3.6" width="17.6" height="14.4" rx="2.4"/><path d="M7 8.2h6M7 12h9M8.4 18v3M15.6 18v3"/>',
  atom: '<circle cx="12" cy="12" r="2.4"/><ellipse cx="12" cy="12" rx="9.4" ry="4.2"/><ellipse cx="12" cy="12" rx="9.4" ry="4.2" transform="rotate(60 12 12)"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.2"/><circle cx="12" cy="12" r="1.6"/>',
  leaf: '<path d="M20.4 3.6c0 8.4-4.3 12.6-10 12.6a4.7 4.7 0 0 1-4.8-4.8C5.6 7.6 10.6 3.6 20.4 3.6Z"/><path d="M4.4 20.4c3.2-4.6 7.4-7.6 12.4-9.4"/>',
  chat: '<path d="M4 5.2h16v11.2H12l-4.6 3.6v-3.6H4z"/><path d="M8.4 9.2h7.2M8.4 12.4h4.6"/>',
  users: '<circle cx="9.2" cy="8.4" r="3.4"/><path d="M3.4 19.6c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2"/><path d="M16 5.6a3.2 3.2 0 0 1 0 6.2M17.6 14.8c2 .6 3.4 2.3 3.4 4.6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.7.3-1 .9-1 1.6v.4"/><path d="M12 17.2h.01"/>',
  clipboard: '<rect x="5.4" y="4.2" width="13.2" height="16.4" rx="2.2"/><path d="M9.4 4.2V3.4h5.2v.8"/><path d="M9 9.6h6M9 13h6M9 16.4h3.4"/>',
  chart: '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7.4" y="12.4" width="3" height="5.2" rx="1"/><rect x="12.4" y="8.6" width="3" height="9" rx="1"/><rect x="17.4" y="5.4" width="3" height="12.2" rx="1"/>',
  calendar: '<rect x="3.6" y="5" width="16.8" height="15" rx="2.4"/><path d="M3.6 9.6h16.8M8.4 3.4v3.2M15.6 3.4v3.2"/>',
  tag: '<path d="M11.2 3.6H20v8.8l-8.6 8.6-8.8-8.8z"/><circle cx="16.2" cy="7.8" r="1.4"/>',
  arrow: '<path d="M4.6 12h14.2M13.4 6.6 18.8 12l-5.4 5.4"/>',
  check: '<path d="M4.8 12.8 9.6 17.6 19.2 6.8"/>',
  phone: '<path d="M6.4 3.8h3l1.6 4-2 1.4a12 12 0 0 0 5.8 5.8l1.4-2 4 1.6v3c0 1.1-.9 2-2 2A16.4 16.4 0 0 1 4.4 5.8c0-1.1.9-2 2-2Z"/>',
  mail: '<rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2.4"/><path d="m4.4 7.4 7.6 5.4 7.6-5.4"/>',
  pin: '<path d="M12 21.2s6.6-6.1 6.6-10.6a6.6 6.6 0 1 0-13.2 0C5.4 15.1 12 21.2 12 21.2Z"/><circle cx="12" cy="10.4" r="2.4"/>',
  clock: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7.2V12l3.4 2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  book: '<path d="M4.4 5.2A2.4 2.4 0 0 1 6.8 2.8H19v15.6H6.8a2.4 2.4 0 0 0 0 4.8H19"/><path d="M8.4 6.8h6.4"/>',
  rocket: '<path d="M13.6 3.6c3.6 0 6.8 3.2 6.8 6.8-1.6 4.4-5.2 7.2-8.8 8.4l-4.4-4.4c1.2-3.6 4-7.2 6.4-10.8Z"/><circle cx="15.2" cy="8.8" r="1.6"/><path d="M7.2 16.8 4 20M8.4 20.4 6.8 18"/>',
  pencil: '<path d="M4 20h4.2L20 8.2 15.8 4 4 15.8z"/><path d="M13.6 6.2 17.8 10.4"/>',
  trash: '<path d="M5.2 7h13.6M9.6 7V4.8h4.8V7M7 7l.9 12.2h8.2L17 7"/><path d="M10.6 10.4v5.8M13.4 10.4v5.8"/>',
  award: '<circle cx="12" cy="9.4" r="5.4"/><path d="M8.6 14 7 21l5-2.6 5 2.6-1.6-7"/>'
};

function icon(name, className) {
  const path = ICONS[name] || ICONS.spark;
  const cls = className ? ` class="${className}"` : '';
  return `<svg${cls} viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
}

function header(site, active) {
  const links = NAV.map((item) => {
    const isActive = item.key === active;
    return `<li><a class="nav-link${isActive ? ' is-active' : ''}" href="${item.href}"${isActive ? ' aria-current="page"' : ''}>${item.label}</a></li>`;
  }).join('\n          ');

  return `<header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/">
        <img class="brand-mark" src="/img/logo.svg" width="44" height="44" alt="">
        <span class="brand-text">
          <span class="brand-name">${escapeHtml(site.name)}</span>
          <span class="brand-sub">Learn &middot; Practise &middot; Achieve</span>
        </span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Toggle navigation" data-nav-toggle>
        ${icon('menu')}
      </button>
      <nav class="site-nav" id="primary-nav" data-nav aria-label="Primary">
        <ul class="nav-list">
          ${links}
        </ul>
        <a class="btn btn-primary btn-sm nav-cta" href="/contact">Book a free demo</a>
      </nav>
    </div>
  </header>`;
}

function footer(site) {
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a class="brand brand-on-dark" href="/">
          <img class="brand-mark" src="/img/logo.svg" width="44" height="44" alt="">
          <span class="brand-name">${escapeHtml(site.name)}</span>
        </a>
        <p>${escapeHtml(site.description)}</p>
        <p class="footer-meta">Established ${escapeHtml(site.established)}</p>
      </div>
      <div class="footer-col">
        <h3>Explore</h3>
        <ul>
          <li><a href="/courses">Courses</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/about">About us</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Programmes</h3>
        <ul>
          <li><a href="/courses#jee-main-advanced-intensive">JEE Intensive</a></li>
          <li><a href="/courses#neet-biology-foundation">NEET Foundation</a></li>
          <li><a href="/courses#class-9-10-science-maths">Class 9 – 10</a></li>
          <li><a href="/courses#spoken-english-communication">Spoken English</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Reach us</h3>
        <ul class="footer-contact">
          <li>${icon('pin')}<span>${escapeHtml(site.address)}</span></li>
          <li>${icon('phone')}<a href="tel:${escapeHtml(String(site.phone).replace(/\s/g, ''))}">${escapeHtml(site.phone)}</a></li>
          <li>${icon('mail')}<a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>&copy; ${year} ${escapeHtml(site.name)}. All rights reserved.</p>
      <p class="footer-links">
        <a href="/blog">Blog</a>
        <span aria-hidden="true">&middot;</span>
        <a href="/admin">Staff console</a>
      </p>
    </div>
  </footer>`;
}

/**
 * Full page document for the server-rendered site.
 */
function page(options) {
  const {
    site,
    title,
    description,
    active = '',
    body,
    bodyClass = '',
    head = ''
  } = options;

  const fullTitle = title ? `${title} &middot; ${site.name}` : `${site.name} &middot; ${site.tagline}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${fullTitle}</title>
  <meta name="description" content="${escapeHtml(description || site.description)}">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/style.css">
  ${head}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
  <a class="skip-link" href="#main">Skip to content</a>
  ${header(site, active)}
  <main id="main">
${body}
  </main>
  ${footer(site)}
  <script src="/js/main.js" defer></script>
</body>
</html>
`;
}

/**
 * Standalone document for a published post. The stylesheet is inlined so the
 * file renders by itself wherever it is opened, and the same document is what
 * the site serves at /blog/<slug>.
 */
function postDocument({ site, post, bodyHtml, css, related = [] }) {
  const relatedHtml = related.length
    ? `<aside class="post-related">
      <h2>Keep reading</h2>
      <ul>
        ${related.map((item) => `<li><a href="/blog/${escapeHtml(item.slug)}">${escapeHtml(item.title)}</a><span>${escapeHtml(formatDate(item.date))}</span></li>`).join('\n        ')}
      </ul>
    </aside>`
    : '';

  const toggleScript = "document.querySelectorAll('[data-nav-toggle]').forEach(function(b){b.addEventListener('click',function(){var n=document.querySelector('[data-nav]');var open=n.classList.toggle('is-open');b.setAttribute('aria-expanded',open?'true':'false');});});";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(post.title)} &middot; ${escapeHtml(site.name)}</title>
  <meta name="description" content="${escapeHtml(post.excerpt)}">
  <meta name="author" content="${escapeHtml(post.author)}">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.excerpt)}">
  <meta property="og:type" content="article">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <style>
${css}
  </style>
</head>
<body class="post-page">
  <a class="skip-link" href="#main">Skip to content</a>
  ${header(site, 'blog')}
  <main id="main">
    <article class="post">
      <div class="container post-shell">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/blog">Blog</a> <span aria-hidden="true">/</span> <span>${escapeHtml(post.category)}</span>
        </nav>
        <header class="post-header">
          <p class="post-kicker"><span class="badge">${escapeHtml(post.category)}</span> ${escapeHtml(formatDate(post.date))}</p>
          <h1>${escapeHtml(post.title)}</h1>
          <p class="post-lede">${escapeHtml(post.excerpt)}</p>
          <p class="post-byline">By ${escapeHtml(post.author)}</p>
        </header>
        <div class="post-body">
${bodyHtml}
        </div>
        <footer class="post-footer">
          <p class="post-share">Published ${escapeHtml(formatDate(post.date))} &middot; ${escapeHtml(post.category)}</p>
          <a class="btn btn-primary" href="/contact">Talk to a counsellor ${icon('arrow')}</a>
        </footer>
        ${relatedHtml}
      </div>
    </article>
  </main>
  ${footer(site)}
  <script>${toggleScript}</script>
</body>
</html>
`;
}

module.exports = { NAV, ICONS, icon, header, footer, page, postDocument };
