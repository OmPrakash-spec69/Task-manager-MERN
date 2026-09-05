const ConfirmModal = ({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, isSubmitting }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <p style={{ color: 'var(--mid-gray)', fontSize: '0.9rem', lineHeight: 1.5 }}>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={isSubmitting} type="button">
            {isSubmitting ? <span className="spinner" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
