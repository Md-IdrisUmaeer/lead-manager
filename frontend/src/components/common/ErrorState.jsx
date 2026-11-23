import Button from './Button';

export default function ErrorState({ message, onRetry, retrying = false }) {
  return (
    <div className="state state--error" role="alert">
      <p className="state__title">Couldn&apos;t load leads</p>
      <p className="state__message">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} loading={retrying}>
          Retry
        </Button>
      )}
    </div>
  );
}
