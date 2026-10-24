'use strict';

const express = require('express');

const content = require('../../lib/content');
const { createPost, deletePost } = require('../../lib/blog');
const { httpError } = require('../http');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ ok: true, posts: content.getPosts(), categories: content.POST_CATEGORIES });
});

/** Publishes a post: posts/<slug>.html plus its entry in content/posts.json. */
router.post('/', (req, res) => {
  const post = createPost(req.body || {});
  console.log(`[blog] published ${post.slug} -> ${post.file}`);
  res.status(201).json({ ok: true, post });
});

router.delete('/:slug', (req, res) => {
  if (!deletePost(req.params.slug)) throw httpError(404, 'That post no longer exists.');
  console.log(`[blog] deleted ${req.params.slug}`);
  res.json({ ok: true });
});

module.exports = router;
