'use strict';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/** Escape a value for safe use inside HTML text or attributes. */
function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Turn a title into a url-safe slug. */
function slugify(value) {
  const slug = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '');
  return slug || 'post';
}

/** Today's date as YYYY-MM-DD (UTC, so containers agree). */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/** "2026-03-12" -> "12 March 2026". Anything else is returned untouched. */
function formatDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
  if (!match) return String(value || '');
  const [, year, month, day] = match;
  const monthName = MONTHS[Number(month) - 1];
  if (!monthName) return String(value);
  return `${Number(day)} ${monthName} ${year}`;
}

/** Valid dates only: normalises to YYYY-MM-DD, falling back to today. */
function normalizeDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
  if (!match) return today();
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return today();
  return match[0];
}

/** First `max` characters of a plain-text body, cut on a word boundary. */
function makeExcerpt(body, max = 180) {
  const text = String(body || '')
    .replace(/^#{2,3}\s+/gm, '')
    .replace(/^[-*>]\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/** Inline formatting: **bold** and *italic*. */
function inline(text) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
}

/**
 * Tiny, dependency-free formatter for post bodies.
 * Blank line separates blocks; supports "## heading", "### heading",
 * "- bullets", "1. numbered lists" and "> quotes".
 */
function renderBody(body) {
  const blocks = String(body || '').replace(/\r\n/g, '\n').split(/\n{2,}/);
  const html = [];

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    if (block.startsWith('### ')) {
      html.push(`<h3>${inline(block.slice(4))}</h3>`);
      continue;
    }
    if (block.startsWith('## ')) {
      html.push(`<h2>${inline(block.slice(3))}</h2>`);
      continue;
    }
    if (block.startsWith('> ')) {
      html.push(`<blockquote>${inline(block.replace(/^>\s?/gm, ' ').trim())}</blockquote>`);
      continue;
    }

    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length && lines.every((line) => /^[-*]\s+/.test(line))) {
      html.push(`<ul>${lines.map((line) => `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`);
      continue;
    }
    if (lines.length && lines.every((line) => /^\d+[.)]\s+/.test(line))) {
      html.push(`<ol>${lines.map((line) => `<li>${inline(line.replace(/^\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`);
      continue;
    }

    html.push(`<p>${inline(lines.join(' '))}</p>`);
  }

  return html.join('\n');
}

module.exports = {
  escapeHtml,
  slugify,
  today,
  formatDate,
  normalizeDate,
  makeExcerpt,
  inline,
  renderBody
};
