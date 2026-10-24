import { useState } from 'react';

import { api } from '../api.js';
import { ConfirmButton, Empty, Field, Loading, Notice, PageHead } from '../components/ui.jsx';
import { useLoad } from '../hooks.js';

const BLANK = {
  title: '',
  level: '',
  duration: '',
  mode: '',
  fee: '',
  icon: 'spark',
  summary: '',
  highlights: ''
};

export default function CoursesPage() {
  const { data, loading, error, reload } = useLoad(() => api.get('/courses'), []);

  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState({ tone: 'info', text: '' });
  const [busy, setBusy] = useState(false);

  const courses = data ? data.courses : [];
  const icons = data ? data.icons : [];

  function update(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  function startEdit(course) {
    setEditing(course.slug);
    setStatus({ tone: 'info', text: '' });
    setForm({
      title: course.title || '',
      level: course.level || '',
      duration: course.duration || '',
      mode: course.mode || '',
      fee: course.fee || '',
      icon: course.icon || 'spark',
      summary: course.summary || '',
      highlights: (course.highlights || []).join('\n')
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(BLANK);
    setStatus({ tone: 'info', text: '' });
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ tone: 'info', text: '' });

    try {
      if (editing) {
        await api.put(`/courses/${editing}`, form);
        setStatus({ tone: 'success', text: 'Course updated — the website shows the change now.' });
      } else {
        await api.post('/courses', form);
        setStatus({ tone: 'success', text: 'Course added to the website.' });
      }
      setEditing(null);
      setForm(BLANK);
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
      await api.del(`/courses/${slug}`);
      if (editing === slug) cancelEdit();
      setStatus({ tone: 'success', text: 'Course removed.' });
      await reload();
    } catch (problem) {
      setStatus({ tone: 'error', text: problem.message });
    }
  }

  return (
    <>
      <PageHead
        title="Courses"
        text="Everything here appears on the courses page and in the contact form's “Interested in” list."
      />

      <Notice tone="error">{error}</Notice>

      <form className="card" onSubmit={submit}>
        <header className="card-head">
          <h2>{editing ? 'Edit course' : 'Add a course'}</h2>
          {editing ? (
            <button className="btn btn-ghost btn-sm" type="button" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </header>

        <div className="field-grid">
          <Field label="Title">
            <input type="text" required value={form.title} onChange={update('title')} placeholder="e.g. JEE Main + Advanced Intensive" />
          </Field>
          <Field label="Level">
            <input type="text" value={form.level} onChange={update('level')} placeholder="e.g. Class 11, 12 & droppers" />
          </Field>
          <Field label="Duration">
            <input type="text" value={form.duration} onChange={update('duration')} placeholder="e.g. 45 weeks" />
          </Field>
          <Field label="Mode">
            <input type="text" value={form.mode} onChange={update('mode')} placeholder="e.g. Offline, 6 days a week" />
          </Field>
          <Field label="Fee">
            <input type="text" value={form.fee} onChange={update('fee')} placeholder="e.g. ₹11,500 / month" />
          </Field>
          <Field label="Icon">
            <select value={form.icon} onChange={update('icon')}>
              {icons.map((name) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Summary" hint="One or two sentences shown on the course card.">
          <textarea rows={3} required value={form.summary} onChange={update('summary')} />
        </Field>

        <Field label="Highlights" hint="One per line — they are shown as the bullet list on the card.">
          <textarea rows={4} value={form.highlights} onChange={update('highlights')} placeholder={'Concept-first teaching\nWeekly tests\nSmall batches'} />
        </Field>

        <Notice tone={status.tone}>{status.text}</Notice>

        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Add course'}
        </button>
      </form>

      <section className="card">
        <header className="card-head">
          <h2>All courses</h2>
          <span className="muted">{courses.length} on the website</span>
        </header>

        {loading ? (
          <Loading />
        ) : courses.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Level</th>
                  <th>Fee</th>
                  <th className="col-action">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.slug} data-editing={editing === course.slug ? 'yes' : undefined}>
                    <td data-label="Course">
                      <strong>{course.title}</strong>
                      <em className="muted">{course.slug}</em>
                    </td>
                    <td data-label="Level">{course.level}</td>
                    <td data-label="Fee">{course.fee}</td>
                    <td data-label="Actions" className="col-action">
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEdit(course)}>
                        Edit
                      </button>
                      <ConfirmButton onConfirm={() => remove(course.slug)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No courses yet — add the first one above.</Empty>
        )}
      </section>
    </>
  );
}
