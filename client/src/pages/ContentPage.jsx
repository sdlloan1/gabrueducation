import { useState } from 'react';

import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { ConfirmButton, Empty, Field, Loading, Notice, PageHead } from '../components/ui.jsx';
import { useLoad } from '../hooks.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ContentPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useLoad(() => api.get('/posts'), []);

  const blank = { title: '', author: user.name, category: '', date: today(), excerpt: '', body: '' };
  const [form, setForm] = useState(blank);
  const [status, setStatus] = useState({ tone: 'info', text: '' });
  const [busy, setBusy] = useState(false);

  const posts = data ? data.posts : [];
  const categories = data ? data.categories : [];
  const category = form.category || categories[0] || '';

  function update(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ tone: 'info', text: '' });

    try {
      const result = await api.post('/posts', { ...form, category: category || categories[0] });
      setForm({ ...blank, author: form.author, category: '' });
      setStatus({
        tone: 'success',
        text: `Published as posts/${result.post.slug}.html — it is on the blog now.`
      });
      await reload();
    } catch (problem) {
      setStatus({ tone: 'error', text: problem.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(slug) {
    setStatus({ tone: 'info', text: '' });
    try {
      await api.del(`/posts/${slug}`);
      setStatus({ tone: 'success', text: 'Post deleted, and its HTML file removed with it.' });
      await reload();
    } catch (problem) {
      setStatus({ tone: 'error', text: problem.message });
    }
  }

  return (
    <>
      <PageHead
        title="Blog content"
        text="Every post is published as its own HTML file in posts/, and listed on the blog straight away."
      />

      <Notice tone="error">{error}</Notice>

      <form className="card" onSubmit={submit}>
        <header className="card-head">
          <h2>New post</h2>
        </header>

        <div className="field-grid">
          <Field label="Title">
            <input type="text" required value={form.title} onChange={update('title')} placeholder="e.g. Building a study routine that lasts" />
          </Field>
          <Field label="Author">
            <input type="text" value={form.author} onChange={update('author')} />
          </Field>
          <Field label="Category">
            <select value={category} onChange={update('category')}>
              {categories.map((name) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input type="date" value={form.date} onChange={update('date')} />
          </Field>
        </div>

        <Field label="Short summary" hint="Optional — the first lines of the post are used when this is left empty.">
          <input type="text" value={form.excerpt} onChange={update('excerpt')} />
        </Field>

        <Field
          label="Post"
          hint="Blank line between paragraphs. ## heading, - bullet, 1. numbered, **bold**, *italic*."
        >
          <textarea rows={12} required value={form.body} onChange={update('body')} />
        </Field>

        <Notice tone={status.tone}>{status.text}</Notice>

        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Publishing…' : 'Publish post'}
        </button>
      </form>

      <section className="card">
        <header className="card-head">
          <h2>Published posts</h2>
          <span className="muted">{posts.length} live</span>
        </header>

        {loading ? (
          <Loading />
        ) : posts.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Published</th>
                  <th>File</th>
                  <th className="col-action">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.slug}>
                    <td data-label="Title">
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                        {post.title}
                      </a>
                    </td>
                    <td data-label="Category">{post.category}</td>
                    <td data-label="Published">{post.date}</td>
                    <td data-label="File">
                      <code>{post.file}</code>
                    </td>
                    <td data-label="Actions" className="col-action">
                      <ConfirmButton onConfirm={() => remove(post.slug)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No posts yet — publish the first one above.</Empty>
        )}
      </section>
    </>
  );
}
