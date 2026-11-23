import Button from './Button';

export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="state">
      <p className="state__title">{title}</p>
      {message && <p className="state__message">{message}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
