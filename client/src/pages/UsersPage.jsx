import { useState } from 'react';

import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { ConfirmButton, Field, Loading, Notice, PageHead } from '../components/ui.jsx';
import { useLoad } from '../hooks.js';

export default function UsersPage() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const { data, loading, error, reload } = useLoad(() => (isAdmin ? api.get('/users') : Promise.resolve(null)), [isAdmin]);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' });
  const [status, setStatus] = useState({ tone: 'info', text: '' });
  const [busy, setBusy] = useState(false);

  const accounts = data ? data.users : [];
  const roles = data ? data.roles : ['admin', 'editor'];

  function update(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  if (!isAdmin) {
    return (
      <>
        <PageHead title="Accounts" />
        <Notice>Only an administrator can manage accounts. Ask an administrator if something here needs changing.</Notice>
      </>
    );
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ tone: 'info', text: '' });

    try {
      await api.post('/users', form);
      setForm({ name: '', email: '', password: '', role: 'editor' });
      setStatus({ tone: 'success', text: 'Account created — they can sign in now.' });
      await reload();
    } catch (problem) {
      setStatus({ tone: 'error', text: problem.message });
    } finally {
      setBusy(false);
    }
  }

  async function patch(id, changes, message) {
    setStatus({ tone: 'info', text: '' });
    try {
      await api.patch(`/users/${id}`, changes);
      setStatus({ tone: 'success', text: message });
      await reload();
    } catch (problem) {
      setStatus({ tone: 'error', text: problem.message });
      await reload();
    }
  }

  async function remove(id) {
    setStatus({ tone: 'info', text: '' });
    try {
      await api.del(`/users/${id}`);
      setStatus({ tone: 'success', text: 'Account deleted.' });
      await reload();
    } catch (problem) {
      setStatus({ tone: 'error', text: problem.message });
    }
  }

  return (
    <>
      <PageHead
        title="Accounts"
        text="Administrators manage courses, content and accounts. Editors manage courses and content only."
      />

      <Notice tone="error">{error}</Notice>

      <form className="card" onSubmit={submit}>
        <header className="card-head">
          <h2>Add an account</h2>
        </header>

        <div className="field-grid">
          <Field label="Name">
            <input type="text" required value={form.name} onChange={update('name')} placeholder="e.g. Neha Bansal" />
          </Field>
          <Field label="Email">
            <input type="email" required value={form.email} onChange={update('email')} placeholder="name@example.com" />
          </Field>
          <Field label="Password" hint="At least 8 characters.">
            <input type="password" required minLength={8} value={form.password} onChange={update('password')} />
          </Field>
          <Field label="Role">
            <select value={form.role} onChange={update('role')}>
              {roles.map((role) => (
                <option value={role} key={role}>
                  {role === 'admin' ? 'Administrator' : 'Editor'}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Notice tone={status.tone}>{status.text}</Notice>

        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <section className="card">
        <header className="card-head">
          <h2>Everyone with access</h2>
          <span className="muted">{accounts.length} accounts</span>
        </header>

        {loading ? (
          <Loading />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="col-action">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td data-label="Person">
                      <strong>{account.name}</strong>
                      <em className="muted">{account.email}</em>
                    </td>
                    <td data-label="Role">
                      <select
                        value={account.role}
                        onChange={(event) => patch(account.id, { role: event.target.value }, `${account.name} is now ${event.target.value === 'admin' ? 'an administrator' : 'an editor'}.`)}
                      >
                        {roles.map((role) => (
                          <option value={role} key={role}>
                            {role === 'admin' ? 'Administrator' : 'Editor'}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td data-label="Status">
                      <button
                        type="button"
                        className={`pill ${account.active ? 'pill-on' : 'pill-off'}`}
                        onClick={() => patch(account.id, { active: !account.active }, account.active ? `${account.name} can no longer sign in.` : `${account.name} can sign in again.`)}
                      >
                        {account.active ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td data-label="Actions" className="col-action">
                      <ConfirmButton onConfirm={() => remove(account.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
