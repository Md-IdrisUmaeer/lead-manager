import Button from './Button';
import Modal from './Modal';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading = false,
}) {
  // Ignore Esc / backdrop while the action is running.
  const handleClose = () => {
    if (!loading) onCancel();
  };

  return (
    <Modal open={open} title={title} onClose={handleClose}>
      <p className="confirm__message">{message}</p>
      <div className="form__actions">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
