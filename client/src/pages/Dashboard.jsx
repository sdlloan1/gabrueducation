import { Link } from 'react-router-dom';

import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Icon from '../components/Icon.jsx';
import { Empty, Loading, Notice, PageHead } from '../components/ui.jsx';
import { useLoad } from '../hooks.js';

function shortDate(value) {
  return String(value || '').slice(0, 10);
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data, loading, error } = useLoad(async () => {
    const [courses, posts, messages] = await Promise.all([
      api.get('/courses'),
      api.get('/posts'),
      api.get('/messages')
    ]);

    /* Accounts are administrator-only, so editors simply do not ask for them. */
    const accounts = user.role === 'admin' ? await api.get('/users') : null;

    return {
      courses: courses.courses,
      posts: posts.posts,
      messages: messages.messages,
      accounts: accounts ? accounts.users : null
    };
  }, [user.role]);

  const stats = data
    ? [
        { label: 'Courses on the website', value: data.courses.length, to: '/courses', icon: 'book' },
        { label: 'Published blog posts', value: data.posts.length, to: '/content', icon: 'pencil' },
        { label: 'Enquiries received', value: data.messages.length, to: '/messages', icon: 'mail' },
        data.accounts
          ? { label: 'Accounts', value: data.accounts.length, to: '/users', icon: 'users' }
          : { label: 'Signed in as', value: user.role === 'admin' ? 'Admin' : 'Editor', to: null, icon: 'users' }
      ]
    : [];

  return (
    <>
      <PageHead title={`Hello, ${user.name.split(' ')[0]}`} text="Everything the website is showing right now." />

      <Notice tone="error">{error}</Notice>
      {loading ? <Loading /> : null}

      {data ? (
        <>
          <div className="stat-grid">
            {stats.map((stat) => (
              <article className="card stat" key={stat.label}>
                <span className="stat-icon">
                  <Icon name={stat.icon} size={20} />
                </span>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
                {stat.to ? (
                  <Link className="stat-link" to={stat.to}>
                    Open
                  </Link>
                ) : null}
              </article>
            ))}
          </div>

          <div className="two-col">
            <section className="card">
              <header className="card-head">
                <h2>Latest posts</h2>
                <Link to="/content">Manage</Link>
              </header>
              {data.posts.length ? (
                <ul className="list">
                  {data.posts.slice(0, 4).map((post) => (
                    <li className="list-item" key={post.slug}>
                      <span>
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                          {post.title}
                        </a>
                        <em>{post.category}</em>
                      </span>
                      <span className="muted">{shortDate(post.date)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No posts published yet.</Empty>
              )}
            </section>

            <section className="card">
              <header className="card-head">
                <h2>Latest enquiries</h2>
                <Link to="/messages">All enquiries</Link>
              </header>
              {data.messages.length ? (
                <ul className="list">
                  {data.messages.slice(0, 4).map((message) => (
                    <li className="list-item" key={`${message.email}-${message.receivedAt}`}>
                      <span>
                        <strong>{message.name}</strong>
                        <em>{message.email}</em>
                      </span>
                      <span className="muted">{shortDate(message.receivedAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No enquiries yet — they arrive from the contact page.</Empty>
              )}
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}
