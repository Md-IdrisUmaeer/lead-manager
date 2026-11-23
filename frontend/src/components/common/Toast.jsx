import { useEffect } from 'react';

const DURATION_MS = 3000;

// `onClose` should be stable (useCallback), or the timer restarts on every render.
export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, DURATION_MS);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`toast toast--${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <span className="toast__message">{message}</span>
      <button type="button" className="toast__close" aria-label="Dismiss" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
