'use strict';

const express = require('express');

const content = require('../../lib/content');

const router = express.Router();

/** Enquiries sent from the contact page, newest first. */
router.get('/', (req, res) => {
  res.json({ ok: true, messages: content.getMessages() });
});

module.exports = router;
