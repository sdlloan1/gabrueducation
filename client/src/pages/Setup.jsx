import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../auth.jsx';
import { Field, Notice } from '../components/ui.jsx';

/** First run: there is no account yet, so the console asks for one. */
export default function Setup() {
  const { createFirstAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await createFirstAdmin({ name: form.name, email: form.email, password: form.password });
      navigate('/', { replace: true });
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <img className="auth-mark" src="/img/logo.svg" width="54" height="54" alt="" />
        <p className="auth-eyebrow">First run</p>
        <h1>Create the first administrator</h1>
        <p className="auth-text">
          This account manages the courses, the blog and everyone else who signs in. You can add
          editors once you are inside.
        </p>

        <Field label="Your name">
          <input type="text" name="name" autoComplete="name" required value={form.name} onChange={update('name')} placeholder="e.g. Amritpal Singh" />
        </Field>

        <Field label="Email">
          <input type="email" name="email" autoComplete="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" />
        </Field>

        <Field label="Password" hint="At least 8 characters.">
          <input type="password" name="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={update('password')} />
        </Field>

        <Field label="Repeat password">
          <input type="password" name="confirm" autoComplete="new-password" required minLength={8} value={form.confirm} onChange={update('confirm')} />
        </Field>

        <Notice tone="error">{error}</Notice>

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>

        <p className="auth-foot">
          <a href="/">← Back to the website</a>
        </p>
      </form>
    </div>
  );
}
