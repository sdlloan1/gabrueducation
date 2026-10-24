'use strict';

const fs = require('fs');

const content = require('./content');
const { slugify, normalizeDate, makeExcerpt, renderBody } = require('./utils');
const { postDocument } = require('./layout');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

function uniqueSlug(base, posts) {
  const taken = new Set(posts.map((post) => post.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/**
 * Publishes a post: writes a standalone HTML file to posts/<slug>.html and
 * records it in content/posts.json. Returns the new post record.
 */
function createPost(input = {}) {
  const title = String(input.title || '').trim();
  const body = String(input.body || '').trim();

  if (title.length < 3) throw new ValidationError('Please give the post a title of at least 3 characters.');
  if (body.length < 20) throw new ValidationError('The post body needs at least 20 characters.');

  const site = content.getSite();
  const posts = content.getPosts();
  const slug = uniqueSlug(slugify(title), posts);
  const category = content.POST_CATEGORIES.includes(String(input.category))
    ? String(input.category)
    : content.POST_CATEGORIES[0];

  const post = {
    slug,
    title,
    author: String(input.author || '').trim() || `${site.name} Team`,
    category,
    date: normalizeDate(input.date),
    excerpt: String(input.excerpt || '').trim() || makeExcerpt(body),
    file: `posts/${slug}.html`,
    url: `/blog/${slug}`,
    createdAt: new Date().toISOString()
  };

  const html = postDocument({
    site,
    post,
    bodyHtml: renderBody(body),
    css: content.getSiteCss(),
    related: posts.slice(0, 3)
  });

  fs.mkdirSync(content.POSTS_DIR, { recursive: true });
  fs.writeFileSync(content.postFilePath(slug), html, 'utf8');
  content.savePosts([post, ...posts]);

  return post;
}

/** Removes a post from the index and deletes its HTML file. */
function deletePost(slug) {
  const posts = content.getPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post) return false;

  content.savePosts(posts.filter((item) => item.slug !== slug));

  try {
    fs.unlinkSync(content.postFilePath(slug));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`[blog] could not remove ${slug}.html: ${error.message}`);
    }
  }

  return true;
}

module.exports = { ValidationError, createPost, deletePost, uniqueSlug };
