'use strict';

/**
 * An error that carries the HTTP status the API should answer with.
 * Anything without a statusCode is treated as a server fault (500).
 */
function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = { httpError };
