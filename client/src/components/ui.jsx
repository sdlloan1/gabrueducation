import { useEffect, useState } from 'react';

export function PageHead({ title, text, children }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {text ? <p className="page-text">{text}</p> : null}
      </div>
      {children ? <div className="page-actions">{children}</div> : null}
    </header>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-note">{hint}</span> : null}
    </label>
  );
}

export function Notice({ tone = 'info', children }) {
  if (!children) return null;
  return (
    <p className={`notice notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}

/** Two-step delete: the first press asks, the second one removes. */
export function ConfirmButton({ onConfirm, children = 'Delete', confirmLabel = 'Confirm', disabled = false }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return undefined;
    const timer = setTimeout(() => setArmed(false), 5000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <button
      type="button"
      className={`btn btn-danger btn-sm${armed ? ' is-armed' : ''}`}
      disabled={disabled}
      onClick={() => {
        if (!armed) {
          setArmed(true);
          return;
        }
        setArmed(false);
        onConfirm();
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}

export function Loading({ children = 'Loading…' }) {
  return <p className="muted">{children}</p>;
}

export function Empty({ children }) {
  return <p className="empty">{children}</p>;
}
