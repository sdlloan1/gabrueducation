'use strict';

const path = require('path');

const ROOT = path.join(__dirname, '..');

module.exports = {
  ROOT,
  DATA_DIR: path.join(ROOT, 'data'),
  CONTENT_DIR: path.join(ROOT, 'content'),
  POSTS_DIR: path.join(ROOT, 'posts'),
  CLIENT_DIR: path.join(ROOT, 'client')
};
