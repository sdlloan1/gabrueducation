import { api } from '../api.js';
import { Empty, Loading, Notice, PageHead } from '../components/ui.jsx';
import { useLoad } from '../hooks.js';

function stamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function MessagesPage() {
  const { data, loading, error } = useLoad(() => api.get('/messages'), []);
  const messages = data ? data.messages : [];

  return (
    <>
      <PageHead title="Enquiries" text="Messages sent from the contact page on the website." />

      <Notice tone="error">{error}</Notice>

      {loading ? (
        <Loading />
      ) : messages.length ? (
        <ul className="message-list">
          {messages.map((message) => (
            <li className="card message" key={`${message.email}-${message.receivedAt}`}>
              <header className="message-head">
                <strong>{message.name}</strong>
                <a href={`mailto:${message.email}`}>{message.email}</a>
                {message.phone ? <span className="muted">{message.phone}</span> : null}
                <span className="muted message-date">{stamp(message.receivedAt)}</span>
              </header>
              {message.interest ? <p className="message-interest">Interested in: {message.interest}</p> : null}
              <p className="message-body">{message.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No enquiries yet. Messages sent from the contact page land here.</Empty>
      )}
    </>
  );
}
