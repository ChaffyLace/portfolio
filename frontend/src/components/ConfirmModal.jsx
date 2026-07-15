import './ConfirmModal.css'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirmer', danger = false }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">{danger ? '⚠️' : '❓'}</div>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onCancel}>Annuler</button>
          <button className={`btn ${danger ? 'btn--danger-solid' : 'btn--primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}