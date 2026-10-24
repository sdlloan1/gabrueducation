'use strict';

const express = require('express');

const content = require('../../lib/content');
const { ICONS } = require('../../lib/layout');
const { slugify } = require('../../lib/utils');
const { httpError } = require('../http');

const router = express.Router();

const ICON_NAMES = Object.keys(ICONS);

function uniqueSlug(base, courses) {
  const taken = new Set(courses.map((course) => course.slug));
  if (!taken.has(base)) return base;

  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/**
 * Validates a course payload. Fields left out are kept from `existing`, so the
 * console can send a whole form and PATCH-like updates stay possible.
 */
function cleanCourse(input, existing) {
  const value = (key, fallback = '') => {
    if (input[key] === undefined) return existing ? String(existing[key] || '') : fallback;
    return String(input[key]).trim();
  };

  const title = value('title');
  if (title.length < 3) throw httpError(400, 'Please give the course a title of at least 3 characters.');

  const summary = value('summary');
  if (summary.length < 10) throw httpError(400, 'Please write a summary of at least 10 characters.');

  const rawHighlights = input.highlights === undefined
    ? (existing && existing.highlights) || []
    : (Array.isArray(input.highlights) ? input.highlights : String(input.highlights || '').split('\n'));
  const highlights = rawHighlights.map((line) => String(line).trim()).filter(Boolean);

  const icon = value('icon', ICON_NAMES[0]);

  return {
    slug: existing ? existing.slug : uniqueSlug(slugify(title), content.getCourses()),
    title,
    level: value('level'),
    duration: value('duration'),
    mode: value('mode'),
    fee: value('fee'),
    icon: ICON_NAMES.includes(icon) ? icon : ICON_NAMES[0],
    summary,
    highlights
  };
}

function findIndex(courses, slug) {
  const index = courses.findIndex((course) => course.slug === slug);
  if (index === -1) throw httpError(404, 'That course no longer exists.');
  return index;
}

router.get('/', (req, res) => {
  res.json({ ok: true, courses: content.getCourses(), icons: ICON_NAMES });
});

router.post('/', (req, res) => {
  const courses = content.getCourses();
  const course = cleanCourse(req.body || {}, null);
  content.saveCourses([...courses, course]);
  console.log(`[courses] added ${course.slug}`);
  res.status(201).json({ ok: true, course });
});

router.put('/:slug', (req, res) => {
  const courses = content.getCourses();
  const index = findIndex(courses, req.params.slug);

  const course = cleanCourse(req.body || {}, courses[index]);
  courses[index] = course;
  content.saveCourses(courses);
  console.log(`[courses] updated ${course.slug}`);
  res.json({ ok: true, course });
});

router.delete('/:slug', (req, res) => {
  const courses = content.getCourses();
  const index = findIndex(courses, req.params.slug);

  const [removed] = courses.splice(index, 1);
  content.saveCourses(courses);
  console.log(`[courses] removed ${removed.slug}`);
  res.json({ ok: true });
});

module.exports = router;
