"use client"

function Modal({ isOpen, onClose, title, message, actionUrl, actionText }) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          {actionUrl && (
            <a href={actionUrl} target="_blank" rel="noopener noreferrer" className="modal-action-btn">
              {actionText || "Download"}
            </a>
          )}
          <button onClick={onClose} className="modal-close-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal

