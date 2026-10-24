'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { pathToFileURL } = require('url');

const express = require('express');

const auth = require('./auth');
const paths = require('./paths');
const apiRoutes = require('./routes');
const { handleSite } = require('./public-site');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PREVIEW = process.env.BASE44_PREVIEW_MODE === '1';
const DIST_DIR = path.join(paths.CLIENT_DIR, 'dist');

/* --------------------------------------------------------------- console */

function hasProductionBuild() {
  return fs.existsSync(path.join(DIST_DIR, 'index.html'));
}

/**
 * Serves the React staff console under /admin.
 *
 * In development Vite runs in middleware mode on this very server, so the whole
 * application stays on one origin and one port: the SPA, its hot reload, the
 * JSON API and the public website all live on host port 3000.
 */
async function mountConsole(app, server) {
  if (hasProductionBuild()) {
    app.use('/admin', express.static(DIST_DIR, { index: false }));
    app.get(/^\/admin(\/.*)?$/, (req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
    return;
  }

  const { createServer } = require('vite');
  const { default: clientConfig } = await import(pathToFileURL(path.join(paths.CLIENT_DIR, 'vite.config.mjs')).href);

  const viteOptions = {
    ...clientConfig,
    /* The config is imported here instead of being handed over as a file: Vite
       bundles a config file into a temporary module beside it, and under
       `node --watch` that file appearing and vanishing restarts the server in a
       loop. Importing it keeps client/vite.config.mjs watched as a plain source
       file, so editing it restarts the server once, normally. */
    configFile: false,
    appType: 'custom',
    server: {
      ...clientConfig.server,
      middlewareMode: true,
      ws: { server }
    }
  };

  // Vite rejects dev requests whose Host it does not recognise. The sandbox
  // serves the app on a rotating host, so in preview mode the check is off —
  // everywhere else Vite keeps its own default.
  if (PREVIEW) viteOptions.server.allowedHosts = true;

  const vite = await createServer(viteOptions);

  app.use((req, res, next) => {
    if (req.url === '/admin' || req.url.startsWith('/admin/')) return vite.middlewares(req, res, next);
    return next();
  });

  app.get(/^\/admin(\/.*)?$/, async (req, res, next) => {
    try {
      const entry = await fs.promises.readFile(path.join(paths.CLIENT_DIR, 'index.html'), 'utf8');
      const html = await vite.transformIndexHtml(req.originalUrl, entry);
      res.status(200).set('Cache-Control', 'no-store').type('html').send(html);
    } catch (error) {
      next(error);
    }
  });
}

/* ------------------------------------------------------------------ app */

async function createApp(server) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(auth.attachUser);

  app.use('/api', apiRoutes);

  /* API failures always answer in JSON, never as an HTML error page. */
  app.use('/api', (error, req, res, next) => { // eslint-disable-line no-unused-vars
    const status = Number(error.statusCode) || 500;
    if (status >= 500) console.error(`[api] ${req.method} ${req.originalUrl} failed:`, error);
    res.status(status).json({
      ok: false,
      error: status >= 500 ? 'Something went wrong on our side.' : error.message
    });
  });

  await mountConsole(app, server);

  /* Everything that is not the console or the API is the public website. */
  app.use(handleSite);

  return app;
}

async function start() {
  const server = http.createServer();
  const app = await createApp(server);
  server.on('request', app);

  server.listen(PORT, HOST, () => {
    console.log(`Gabru Education running at http://${HOST}:${PORT}`);
    console.log(`Staff console: http://${HOST}:${PORT}/admin`);
  });

  const stop = () => {
    server.close(() => process.exit(0));
    /* The console holds a hot-reload socket open, and an upgraded connection
       keeps server.close() from ever finishing — which would leave `node
       --watch` waiting for a restart that never happens. Give the clean close a
       moment, then leave anyway. */
    setTimeout(() => process.exit(0), 1500).unref();
  };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);

  return server;
}

module.exports = { createApp, start, PORT, HOST };
