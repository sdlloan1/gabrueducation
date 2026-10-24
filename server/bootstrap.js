'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const MARKER = path.join(ROOT, 'node_modules', 'express');

/**
 * The sandbox environment starts this app with `node --watch server.js`, with the
 * source checkout bind-mounted and no install step of its own, so the dependencies
 * are fetched once on first boot. node_modules then lives in the checkout and
 * survives container restarts, which makes later boots instant.
 */
function ensureDependencies() {
  if (fs.existsSync(MARKER)) return;
  if (!fs.existsSync(path.join(ROOT, 'package-lock.json'))) {
    console.warn('[bootstrap] no package-lock.json — run `npm install` in the project root.');
    return;
  }

  console.log('[bootstrap] installing dependencies for the first run…');
  const result = spawnSync('npm', ['ci', '--no-audit', '--no-fund'], { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) {
    console.error('[bootstrap] npm ci failed — run `npm install` in the project root, then start again.');
  }
}

module.exports = { ensureDependencies };
