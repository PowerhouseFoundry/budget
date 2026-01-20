// src/components/Modal.jsx
import './Modal.css'

export default function Modal({ title, children, onClose, actions }){
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          {actions || <button className="btn primary" onClick={onClose}>OK</button>}
        </div>
      </div>
    </div>
  )
}
