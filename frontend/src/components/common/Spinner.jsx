// Pass label={null} when the spinner is decorative (e.g. inside a busy button).
export default function Spinner({ size = 'md', label = 'Loading' }) {
  return label ? (
    <span className={`spinner spinner--${size}`} role="status" aria-label={label} />
  ) : (
    <span className={`spinner spinner--${size}`} aria-hidden="true" />
  );
}
