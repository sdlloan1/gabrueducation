import express from 'express';

const router = express.Router();

// Deterministic, dependency-free artwork for the seeded catalogue. The app's
// demo images are requested from this route so the storefront never depends on
// an external image host.
const PALETTES = [
  ['#1d4ed8', '#60a5fa'],
  ['#0f766e', '#34d399'],
  ['#7c3aed', '#c084fc'],
  ['#b45309', '#fbbf24'],
  ['#be123c', '#fb7185'],
  ['#0f172a', '#475569'],
];

function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, (character) => `&#${character.charCodeAt(0)};`);
}

router.get('/placeholders/:name', (req, res) => {
  const name = String(req.params.name || 'art').replace(/\.svg$/i, '');
  const label = escapeXml(String(req.query.label || name.replace(/[-_]/g, ' ')).slice(0, 48));
  const width = Math.min(2400, Math.max(80, Number(req.query.w) || 800));
  const height = Math.min(2400, Math.max(80, Number(req.query.h) || 600));
  const hash = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);
  const [from, to] = PALETTES[hash % PALETTES.length];
  const fontSize = Math.round(Math.min(width, height) / 9);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}" />
      <stop offset="1" stop-color="${to}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)" />
  <circle cx="${width * 0.82}" cy="${height * 0.2}" r="${height * 0.34}" fill="#ffffff" opacity="0.10" />
  <circle cx="${width * 0.16}" cy="${height * 0.86}" r="${height * 0.28}" fill="#ffffff" opacity="0.08" />
  <rect x="${width * 0.06}" y="${height * 0.62}" width="${width * 0.16}" height="${height * 0.06}" rx="${height * 0.03}" fill="#ffffff" opacity="0.35" />
  <text x="${width * 0.06}" y="${height * 0.5}" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" opacity="0.96">${label}</text>
</svg>`;

  res.set('Content-Type', 'image/svg+xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(svg);
});

export default router;
