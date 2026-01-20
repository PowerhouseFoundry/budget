// src/components/MessageModal.jsx
import './MessageModal.css'

export default function MessageModal({ message, onClose, onAction }){
  if(!message) return null
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <div className="modal-title">{message.subject}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-meta">
          <div className="from"><strong>From:</strong> {message.sender}</div>
          <div className="cat"><strong>Category:</strong> {message.category}</div>
          <div className="time"><strong>Time:</strong> {message.time}</div>
        </div>
        <div className="modal-body">
          {message.body.split('\n').map((p,i)=>(<p key={i}>{p}</p>))}
        </div>
        {message.actions?.length>0 && (
          <div className="modal-actions">
            {message.actions.map(a=>(
              <button key={a.id} className={'btn ' + (a.level || 'primary')}
                onClick={()=>onAction(a.id)}>{a.label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
