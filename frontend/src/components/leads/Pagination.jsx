import Button from '../common/Button';

export default function Pagination({ page, totalPages, onPageChange, disabled = false }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <Button variant="secondary" onClick={() => onPageChange(page - 1)} disabled={disabled || page <= 1}>
        ‹ Prev
      </Button>
      <span className="pagination__info" aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <Button variant="secondary" onClick={() => onPageChange(page + 1)} disabled={disabled || page >= totalPages}>
        Next ›
      </Button>
    </nav>
  );
}
