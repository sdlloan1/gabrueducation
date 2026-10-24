import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import Icon from './Icon.jsx';
import { useAuth } from '../auth.jsx';

const LINKS = [
  { to: '/', label: 'Overview', icon: 'chart', end: true },
  { to: '/courses', label: 'Courses', icon: 'book' },
  { to: '/content', label: 'Blog content', icon: 'pencil' },
  { to: '/messages', label: 'Enquiries', icon: 'mail' },
  { to: '/users', label: 'Accounts', icon: 'users', adminOnly: true }
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = LINKS.filter((link) => !link.adminOnly || user.role === 'admin');

  async function signOut() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="console">
      <header className="console-bar">
        <a className="console-brand" href="/admin">
          <img src="/img/logo.svg" width="38" height="38" alt="" />
          <span className="console-brand-text">
            <strong>Gabru Education</strong>
            <em>Staff console</em>
          </span>
        </a>
        <div className="console-user">
          <span className="console-user-text">
            <strong>{user.name}</strong>
            <em>{user.role === 'admin' ? 'Administrator' : 'Editor'}</em>
          </span>
          <button className="btn btn-ghost btn-sm" type="button" onClick={signOut}>
            <Icon name="logout" size={16} />
            Sign out
          </button>
        </div>
      </header>

      <div className="console-body">
        <nav className="console-nav" aria-label="Console sections">
          <ul className="console-links">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} className={({ isActive }) => `console-link${isActive ? ' is-active' : ''}`}>
                  <Icon name={link.icon} size={18} />
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="console-nav-foot">
            <a href="/">← Back to the website</a>
          </p>
        </nav>

        <main className="console-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
