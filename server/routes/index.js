'use strict';

const express = require('express');

const { requireAuth } = require('../auth');

const router = express.Router();

/* Open: signing in, creating the first administrator, and the contact form. */
router.use('/auth', require('./auth'));
router.use('/contact', require('./contact'));

/* Everything past here belongs to the staff console and needs a session. */
router.use(requireAuth);
router.use('/courses', require('./courses'));
router.use('/posts', require('./posts'));
router.use('/messages', require('./messages'));
router.use('/users', require('./users'));

router.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Unknown API route.' });
});

module.exports = router;
