'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const DATA_DIR = path.join(ROOT, 'data');
const POSTS_DIR = path.join(ROOT, 'posts');
const CSS_FILE = path.join(ROOT, 'public', 'css', 'style.css');

const POST_CATEGORIES = [
  'Study Skills',
  'Exam Preparation',
  'Career Guidance',
  'Parent Corner',
  'Classroom Notes'
];

const SITE_FALLBACK = {
  name: 'Gabru Education',
  tagline: 'Learning that builds confident students.',
  description: 'Gabru Education is a modern learning centre for school students and competitive-exam aspirants.',
  email: 'hello@gabrueducation.in',
  phone: '+91 98765 43210',
  address: 'Sector 22, Chandigarh',
  hours: 'Monday to Saturday, 8:00 AM – 8:00 PM',
  established: '2013',
  social: []
};

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`[content] could not read ${path.basename(file)}: ${error.message}`);
    }
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, file);
}

function getSite() {
  return { ...SITE_FALLBACK, ...readJson(path.join(CONTENT_DIR, 'site.json'), {}) };
}

function getCourses() {
  const courses = readJson(path.join(CONTENT_DIR, 'courses.json'), []);
  return Array.isArray(courses) ? courses : [];
}

/** Posts newest first. */
function getPosts() {
  const posts = readJson(path.join(CONTENT_DIR, 'posts.json'), []);
  if (!Array.isArray(posts)) return [];
  return posts
    .filter((post) => post && post.slug && post.title)
    .sort((a, b) => {
      if (a.date === b.date) return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
}

function savePosts(posts) {
  writeJson(path.join(CONTENT_DIR, 'posts.json'), posts);
}

function saveCourses(courses) {
  writeJson(path.join(CONTENT_DIR, 'courses.json'), courses);
}

function getPost(slug) {
  return getPosts().find((post) => post.slug === slug) || null;
}

function postFilePath(slug) {
  return path.join(POSTS_DIR, `${slug}.html`);
}

function getSiteCss() {
  return fs.readFileSync(CSS_FILE, 'utf8');
}

function getMessages() {
  const messages = readJson(path.join(DATA_DIR, 'messages.json'), []);
  return Array.isArray(messages) ? messages.slice().reverse() : [];
}

function addMessage(message) {
  const file = path.join(DATA_DIR, 'messages.json');
  const existing = readJson(file, []);
  const list = Array.isArray(existing) ? existing : [];
  list.push(message);
  writeJson(file, list);
  return message;
}

module.exports = {
  ROOT,
  CONTENT_DIR,
  DATA_DIR,
  POSTS_DIR,
  POST_CATEGORIES,
  getSite,
  getCourses,
  getPosts,
  savePosts,
  saveCourses,
  getPost,
  postFilePath,
  getSiteCss,
  getMessages,
  addMessage
};
