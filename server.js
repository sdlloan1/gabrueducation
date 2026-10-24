'use strict';

/**
 * Entry point.
 *
 * The HTTP application itself lives in server/app.js; this file only makes sure
 * the dependencies exist (the sandbox container starts this file directly, with
 * no install step of its own) before handing over.
 */

const { ensureDependencies } = require('./server/bootstrap');

ensureDependencies();

require('./server/app')
  .start()
  .catch((error) => {
    console.error('[server] could not start:', error);
    process.exit(1);
  });
